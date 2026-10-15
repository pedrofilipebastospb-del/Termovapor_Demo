"""Import local source databases read-only and adapt to the frontend domain."""
from pathlib import Path
import os, runpy, json, re, hashlib
from datetime import datetime
BASE=Path(__file__).resolve().parent.parent
os.environ.setdefault('TERMOVAPOR_SOURCE_ROOT', str(BASE.parent.parent/'Termovapor--demo'))
runpy.run_path(str(BASE/'scripts/read-sources.py'))
d=json.loads((BASE/'.local-data/dataset.json').read_text())
registry=json.loads((BASE/'.local-data/documents.json').read_text())['files']
def pdf_url(id):return '/api/documentos/'+id if id in registry else None
def clean(v):
 s=str(v if v is not None else '')
 return '' if s in ('None','null') else s.replace(chr(8212),' · ')
def dt(v):
 s=clean(v)
 for fmt in ('%Y-%m-%d','%d/%m/%Y','%d-%m-%Y'):
  try:return datetime.strptime(s[:10],fmt).date().isoformat()
  except ValueError:pass
 return ''
def status(v):
 key=clean(v).replace('_',' ').upper()
 return {'NOVA':'Nova','EM EXECUCAO':'Em execução','EM PREPARACAO':'Em preparação','EM FABRICO':'Em fabrico','DEFINICAO':'Definição','CONCLUIDO':'Concluído','CONCLUIDA':'Concluída','ABERTA':'Aberta','EM MONTAGEM':'Em montagem','AGUARDA MATERIAL':'Aguarda material','MATERIAL RESERVADO':'Material reservado','EM TESTE':'Em teste','CANCELADA':'Cancelada','RASCUNHO':'Rascunho','ENVIADA':'Enviada','CONFIRMADA':'Confirmada','RECEBIDA':'Recebida','RECEBIDA PARCIAL':'Recebida parcial'}.get(key,clean(v))
oes={o['id']:o for o in d['oes']}; nfs={n['id']:n for n in d['nfs']}; reqs={r['id']:r for r in d['requests']}
def oe_num(id):return int(oes[id]['numero']) if id in oes else None
s={k:[] for k in ['clientes','oes','nfs','documentos','pedidos','artigos','quadros','oifs','fornecedores','encomendas','rececoes','movimentos','auditoria']}
for c in d['customers']:
 s['clientes'].append(dict(codigo=c['codigo'],nome=c['nome'],morada=c['morada'],localidade='',nif=''))
for o in d['oes']:
 s['oes'].append(dict(numero=int(o['numero']),dataCriacao=dt(o['data_criacao']),dataEntrega=dt(o['data_entrega']),clienteCodigo=o['cliente_sage_numero'],cliente=o['cliente'],moradaCliente=o['morada_cliente'],moradaInstalacao=o['morada_instalacao'],encomendaCliente=o['encomenda_cliente'],orcamento=o['orcamento'],descricao=o['descricao'],responsavel=o['responsavel'],prioridade=o['prioridade'],estado=status(o['estado']),observacoes=o['observacoes']))
for n in d['nfs']:
 fields={f['field_key']:clean(f['value']) for f in n['fields']}
 s['nfs'].append(dict(numero=n['numero'],oe=oe_num(n['oe_id']),tipo=n['tipo'],registoTipo=n['registo_tipo'],designacao=n['designacao'] or n['tipo'],estado=status(n['estado']),campos=fields,camposOriginais=[dict(key=f['field_key'],label=f['label'],section=f['section'],electrical=any(x in f['section'].lower() for x in ['eletr','automa']),type='text') for f in n['fields']],associados=[nfs[i]['numero'] for i in n.get('associated_nf_ids',[]) if i in nfs]))
for r in d['requests']:
 s['pedidos'].append(dict(codigo=r['request_code'],oe=oe_num(r['oe_id']),titulo=r['title'],quadroNf=r['board_nf_oe'] or r['board_nf_oif'],quadroNfOIF=r['board_nf_oif'],estadoOIFOrigem={'EM ELABORACAO':'Em elaboração','DEVOLVIDA A OE':'Devolvida à OE'}.get(r['oif_status'],r['oif_status']),nfs=[nfs[i]['numero'] for i in r['nf_ids'] if i in nfs],hmi='Com HMI' if r['hmi_common']=='Sim' else 'Sem HMI' if r['hmi_common']=='Nao' else 'A definir',alimentacao='',motores='',sondas='',requisitos=r['general_requirements'],estado='Devolvido à OE' if r['return_revision'] else 'Enviado ao OIF',revisao=r['revision'],oif=r['oif_number'],definicaoFinal=clean(r['response_notes'])))
for a in d['articles']:
 s['artigos'].append(dict(id=str(a['id_artigo']),codigo=a['codigo'],codigoInterno=a['codigo_interno'],descricao=a['descricao'],marca=a['marca'],referencia=a['referencia_fabricante'],categoria=a['categoria'],unidade=a['unidade'],stock=a['quantidade'],stockRegistado=a['stock_registado'],reservado=a['quantidade_reservada'],minimo=a['stock_minimo'],localizacao='',custo=a['custo_interno_unitario']))
for q in d['panels']:
 r=next((r for r in d['requests'] if r['id_quadro']==q['id_quadro']),{})
 oe=oe_num(r.get('oe_id')) or (int(q['numero_oe']) if q['numero_oe'].isdigit() else q['numero_oe'])
 s['quadros'].append(dict(id=str(q['id_quadro']),codigo=q['codigo'],descricao=q['descricao'],oe=oe,nf=r.get('board_nf_oif',''),cliente=oes.get(r.get('oe_id'),{}).get('cliente',''),esquema=q['numero_esquema'],revisao=q['revisao'],pdf=next((doc['name'] for doc in d['documents'] if doc['id']=='panel-'+str(q['id_quadro'])),''),pdfUrl=pdf_url('panel-'+str(q['id_quadro'])),linhas=[dict(id=str(l['id_linha']),artigoId=str(l['id_artigo']) if l['id_artigo'] else None,refExtraida=l['referencia'] or l['codigo'],descricaoExtraida=l['descricao'],fabricante=l['marca'],designacao='',quantidade=l['quantidade'],**({'custoAplicado':float(l['custo_unitario_aplicado'])} if l['custo_unitario_aplicado']!='' else {})) for l in d['panelMaterials'] if l['id_quadro']==q['id_quadro']]))
for o in d['oifs']:
 r=next((r for r in d['requests'] if r['id_oif']==o['id_oif']),{})
 # Only source-confirmed events, never synthesize missing milestones.
 events=[e for e in d['timeline'] if e['id_oif']==o['id_oif'] and e['data_hora']>=o['data_criacao']]
 s['oifs'].append(dict(numero=o['numero_oif'],quadroId=str(o['id_quadro']),pedido=r.get('request_code',''),oe=oe_num(o['oe_id']) or o['numero_oe'],nf=r.get('board_nf_oif',''),quantidade=o['quantidade'],estado=status(o['estado']),responsavel=o['responsavel'],prazo=dt(o['prazo']),prazoOriginal=clean(o['prazo']),importada=True,criadaEm=dt(o['data_criacao']),etapas=[dict(etapa='OIF criada',data=dt(e['data_hora']),utilizador='',nota=e['detalhe']) for e in events if e['evento']=='OIF CRIADA'],reservas={str(m['id_artigo']):m['quantidade_reservada'] for m in d['materials'] if m['id_oif']==o['id_oif']},custos={str(m['id_artigo']):m['custo_unitario_snapshot'] for m in d['materials'] if m['id_oif']==o['id_oif']},materiaisConfirmados=[dict(artigoId=str(m['id_artigo']),quantidade=m['quantidade_necessaria']) for m in d['materials'] if m['id_oif']==o['id_oif']],maoObra=o['custo_mao_obra'],outrosCustos=o['outros_custos'],observacoes=o['observacoes']))
for f in d['suppliers']:s['fornecedores'].append(dict(codigo=f['codigo'],nome=f['nome'],nif=f['nif'],email=f['email'],telefone=f['telefone'],prazoMedio=0))
for e in d['purchases']:
 f=next((f for f in d['suppliers'] if f['id_fornecedor']==e['id_fornecedor']),{})
 s['encomendas'].append(dict(numero=e['numero_encomenda'],fornecedor=f.get('codigo',''),data=dt(e['data_encomenda']),previsao='',estado=status(e['estado']),linhas=[dict(artigoId=str(l['id_artigo']),quantidade=l['quantidade'],preco=l['preco_unitario'],recebido=0) for l in e['lines']]))
for m in d['stockMovements']:
 s['movimentos'].append(dict(id=str(m['id_movimento']),artigoId=str(m['id_artigo']),tipo={'ENTRADA':'Entrada','SAIDA':'Saída','RESERVA':'Reserva','LIBERTACAO':'Libertação','AJUSTE':'Ajuste'}.get(m['tipo'],'Ajuste'),quantidade=m['quantidade'],documento=m['documento_origem'],data=dt(m['data_movimento']),observacoes=m['observacoes']))
for doc in d['documents']:
 kind=doc['owner_type']; id=doc['owner_id']; owner=oes.get(id) if kind=='oe' else nfs.get(id) if kind=='nf' else reqs.get(id) if kind=='request' else None
 oe=oe_num(id) if kind=='oe' else oe_num(owner.get('oe_id')) if owner else None
 if kind=='panel':
  panel=next((q for q in s['quadros'] if q['id']==str(id)),None)
  oe=panel['oe'] if panel else None
 if oe is None:continue
 item=dict(id=doc['id'],oe=oe,categoria='Elétrica / automação' if doc['source']=='oif' else 'Geral OE',descricao=doc['description'],nome=doc['name'],data='',paginas=0,pdfUrl=pdf_url(doc['id']),disponivel=doc['id'] in registry)
 if kind=='nf':item['nf']=owner['numero']
 if kind=='request':item['pedidoCodigo']=owner['request_code']
 if kind=='panel':
  item['quadroId']=str(id)
  if panel['nf']:item['nf']=panel['nf']
 s['documentos'].append(item)
for e in d['timeline']:
 o=next((o for o in d['oifs'] if o['id_oif']==e['id_oif'] and e['data_hora']>=o['data_criacao']),None)
 if o:s['auditoria'].append(dict(id='oif-event-'+str(e['id_evento']),data=e['data_hora'].replace(' ','T'),entidade='OIF',referencia=o['numero_oif'],acao=e['evento'],detalhe=e['detalhe'],utilizador=''))
s['auditoria'].sort(key=lambda e:e['data'],reverse=True)
# Include the separately allocated common electrical NF in sequence protection.
reserved={int(n['numero']) for n in d['nfs'] if n['numero'].isdigit()}
reserved.update(int(r['board_nf_oe'].split('/')[0]) for r in d['requests'] if r['board_nf_oe'].split('/')[0].isdigit())
s['nfReservados']=sorted(reserved)
s['sequencias']=dict(oe=max(o['numero'] for o in s['oes']),nf=max(reserved),oif=max(int(o['numero'].split('-')[-1]) for o in s['oifs']),encomenda=max([int(e['numero'].split('-')[-1]) for e in s['encomendas']]+[0]),rececao=0)
# Remove long dashes from imported display text without changing source databases.
def sanitize(v):
 if isinstance(v,str):return v.replace(chr(8212),' · ')
 if isinstance(v,list):return [sanitize(x) for x in v]
 if isinstance(v,dict):return {k:sanitize(x) for k,x in v.items()}
 return v
s=sanitize(s)
expected={'clientes':2693,'artigos':999,'oes':3,'nfs':15,'oifs':8}
assert all(len(s[k])==v for k,v in expected.items()),'Source counts differ; review import.'
raw=json.dumps(s,ensure_ascii=False)
out=BASE/'.local-data/state.json';out.write_text(json.dumps(dict(version=hashlib.sha256(raw.encode()).hexdigest()[:16],state=s),ensure_ascii=False));out.chmod(0o600)
print('Dados reais preparados:', {k:len(s[k]) for k in expected})
