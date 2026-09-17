import json,re,pdfplumber
from pathlib import Path
docs=json.loads(Path('../tmp/pdfs/docs.json').read_text())
groups={3:[(2,2020,2026),(3,2019,2019),(4,2016,2018),(5,2011,2015)],4:[(2,2023,2026),(3,2021,2022),(4,2019,2020),(5,2016,2018),(6,2015,2015),(7,2014,2014),(8,2013,2013),(9,2012,2012),(10,2011,2011)],1:[(1,2021,2026)],5:[(2,2023,2026)]}
allrows=[]
for k,parts in groups.items():
 with pdfplumber.open(Path('..')/docs[k]['path']) as pdf:
  for pn,start,end in parts:
   p=pdf.pages[pn-1];table=p.find_tables()[0];courses=[]
   for grade,row in enumerate(table.rows[1:],1):
    b=row.cells[1];left=table.rows[0].cells[1][0];mid=table.rows[0].cells[1][2];right=table.bbox[2]
    for term,(x0,x1) in enumerate([(left,mid),(mid,right)],1):
     tx=p.crop((x0,b[1],x1+0.1,b[3])).extract_text(x_tolerance=2) or ''
     matches=list(re.finditer(r'(?:M\d{4}\.\d+|\d{3,4}\.\d+[A-Z]?)',tx))
     for n,m in enumerate(matches):
      raw=tx[m.end():matches[n+1].start() if n+1<len(matches) else len(tx)].strip()
      required='＊' in raw or '*' in raw
      raw=raw.replace('＊','').replace('*','');credit=re.search(r'\((\d+(?:\.\d+)?)\)\s*$',raw)
      name=re.sub(r'\s+',' ',raw[:credit.start()] if credit else raw).strip()
      c={'id':m.group(),'name':name,'credit':float(credit[1]) if credit else None,'required':required,'grade':grade,'term':term}
      if k in (4,5):
       if c['id']=='4013.311':c['term']=2
       if c['id']=='4013.315':c.update(id='M1498.004300',name='건축공학캡스톤설계' if k==4 else 'Capstone Design in Architectural Engineering',note='구 건축공학시스템설계와 대체·동일 인정' if k==4 else 'Replacement/equivalent of former System Design')
       if c['id']=='4013.408' and '스마트' in c['name']:c['name']='건설경영'
      courses.append(c)
   if k==4 and start==2021 and not any(c['id']=='M1498.002700' for c in courses):courses.append({'id':'M1498.002700','name':'스마트건설기술','credit':3,'required':False,'grade':4,'term':1,'note':'캡스톤설계 동시 수강 선택과목 정정 반영'})
   reqpage=pdf.pages[0] if k==5 else p
   top=table.bbox[1] if k!=5 else reqpage.height
   tx=reqpage.crop((40,0,reqpage.width-35,top)).extract_text() or ''
   # Full numbered requirements precede the semester table.
   startmatch=re.search(r'(?:^|\n)\s*1\.',tx)
   tx=tx[startmatch.start():] if startmatch else tx
   tx=tx.replace('건축공학시스템설계','건축공학캡스톤설계').replace('건축환경설계, 구조설계, 건설경영','건축환경설계, 구조설계, 스마트건설기술')
   reqs=[re.sub(r'\s+',' ',s).strip() for s in re.split(r'\n(?=\s*\d+\.)',tx) if s.strip()]
   allrows.append({'track':'architecture' if k in (1,3) else 'engineering','lang':'en' if k in (1,5) else 'ko','start':start,'end':end,'courses':courses,'requirements':reqs,'source':docs[k]['name'],'page':pn})
Path('public/curricula.json').write_text(json.dumps(allrows,ensure_ascii=False))
print([(r['track'],r['lang'],r['start'],len(r['courses']),sum(c['credit'] is None for c in r['courses'])) for r in allrows])
