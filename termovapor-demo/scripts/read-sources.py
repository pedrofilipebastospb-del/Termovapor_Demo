"""Read-only source adapter. Output is private, ignored, local development only."""
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
import sqlite3,json,re,os
BASE=Path(__file__).resolve().parent.parent
SOURCE_ROOT=Path(os.environ.get('TERMOVAPOR_SOURCE_ROOT',BASE.parent)).expanduser().resolve()
OIF=SOURCE_ROOT/'OIF_ELETRICO_V3_3_RECECAO_OE_NF'
OE=SOURCE_ROOT/'OE_V1_4_37_PESQUISA_SAGE_CORRIGIDA'/'OE_V1_4_37_PESQUISA_SAGE_CORRIGIDA'
if not (OE/'oe_v1.db').is_file() or not (OIF/'database/oif.db').is_file():
 raise SystemExit('Bases originais não encontradas. Defina TERMOVAPOR_SOURCE_ROOT para a pasta que contém OE e OIF.')
def conn(path):
 c=sqlite3.connect(path.resolve().as_uri()+'?mode=ro&immutable=1',uri=True);c.row_factory=sqlite3.Row;c.execute('PRAGMA query_only=ON');return c
def rows(c,t):return [dict(r) for r in c.execute(f'SELECT * FROM "{t}"')]
def pick(r,keys):return {k:r.get(k) if r.get(k) is not None else '' for k in keys.split()}
def j(value):
 try:return json.loads(value or '[]')
 except (ValueError,TypeError):return []
def text(v):return str(v or '')
def exact_oe(v):return next((o['id'] for o in D['oes'] if o['numero']==str(v)),None)
a=conn(OE/'oe_v1.db');b=conn(OIF/'database/oif.db')
D=dict(mode='local',snapshot=datetime.now(ZoneInfo('Europe/Lisbon')).date().isoformat(),oes=[],nfs=[],requests=[],oifs=[],panels=[],articles=[],materials=[],panelMaterials=[],documents=[],timeline=[],suppliers=[],purchases=[],customers=[],stockMovements=[],receipts=[],supplierArticles=[],auditHistory=[],subNfs=[])
for r in rows(a,'oe'):
 item=pick(r,'id numero cliente cliente_sage_numero morada_cliente morada_instalacao descricao responsavel data_criacao data_entrega estado prioridade encomenda_cliente orcamento observacoes');item['numero']=str(r['numero']);D['oes'].append(item)
def sagecode(value):return re.sub(r'\.0$','',re.sub(r'^=\s*"(.*)"$',r'\1',text(value).strip()))
for index,r in enumerate(sorted(rows(a,'sage_clients'),key=lambda r:(text(r['nome']).casefold(),text(r['codigo']))),1):
 D['customers'].append(dict(id=index,codigo=sagecode(r['codigo']),nome=text(r['nome']),morada=text(r['morada']),updated_at=text(r['updated_at']),origem='Listagem Sage importada na base OE · sem ligação em tempo real'))
allfields=rows(a,'nf_fields')
for r in rows(a,'nf'):
 item=pick(r,'id numero oe_id tipo designacao estado registo_tipo nf_aplicavel nf_existente');item['numero']=text(r['numero']);item['nf_aplicavel']=bool(r['nf_aplicavel']);item['fields']=[pick(f,'section field_key label value sort_order') for f in allfields if f['nf_id']==r['id']];item['associated_nf_ids']=[];D['nfs'].append(item)
for n in D['nfs']:
 association=next((f['value'] for f in n['fields'] if f['field_key']=='associado_caldeiras'),'')
 refs=re.findall(r'\bNF\s+(\d+)\b',association,re.I)
 n['associated_nf_ids']=[x['id'] for x in D['nfs'] if x['numero'] in refs and x['oe_id']==n['oe_id']]
# Preserve registry references even if no longer used. Component labels are
# derived only from fields that explicitly store the same reference.
component_labels={'subnf_bomba':'Bomba de água','subnf_queimador':'Queimador','subnf_valvula_seguranca':'Válvula de segurança','subnf_pressostato_servico':'Pressostato de serviço','subnf_pressostato_seguranca':'Pressostato de segurança','subnf_quadro':'Quadro elétrico','subnf_economizador':'Economizador','subnf_separador_vapor':'Separador de vapor','subnf_chamine':'Chaminé','subnf_deposito_condensados':'Depósito de condensados','subnf_multiciclone':'Multiciclone','subnf_tratamento_agua':'Tratamento de água','subnf_coletor_distribuidor':'Coletor / distribuidor','subnf_reservatorio_gasoleo':'Reservatório de gasóleo','subnf_reservatorio_nafta':'Reservatório de nafta'}
def electrical_subnf(field):
 key=field['field_key'];section=field['section']
 return key in ('subnf_quadro','quadro_subnf','subnf_pressostato_servico','subnf_pressostato_seguranca') or bool(re.match(r'ta\d+_(quadro|valvula)_',key)) or section=='eletrica'
for r in rows(a,'subnf_number_registry'):
 parent=next((n for n in D['nfs'] if n['numero']==str(r['base_nf'])),None)
 refs=[f for f in allfields if 'subnf' in f['field_key'] and text(f['value']).strip()==r['full_ref']]
 labels=[]
 for f in refs:
  label=component_labels.get(f['field_key'],f['section'].replace('_',' '))
  if label not in labels:labels.append(label)
 D['subNfs'].append(dict(full_ref=r['full_ref'],base_nf=str(r['base_nf']),nf_id=parent['id'] if parent else None,component=' / '.join(labels) if labels else 'Referência reservada no registo',section=refs[0]['section'] if refs else '',field_key=refs[0]['field_key'] if refs else '',assigned_at=text(r['assigned_at']),note=text(r['note']),electrical=any(electrical_subnf(f) for f in refs),active=bool(refs)))
for r in rows(b,'oif_quadros'):
 item=pick(r,'id_oif numero_oif id_quadro numero_oe quantidade data_criacao estado responsavel prazo observacoes custo_mao_obra outros_custos');item['oe_id']=exact_oe(r['numero_oe']);D['oifs'].append(item)
for r in rows(b,'quadros_eletricos'):D['panels'].append(pick(r,'id_quadro codigo descricao numero_esquema revisao numero_oe responsavel prazo observacoes'))
imported=rows(b,'oe_electrical_requests')
request_map={}
for r in rows(a,'electrical_requests'):
 if r['status']=='ELIMINADA':continue
 oe_number=next(o['numero'] for o in D['oes'] if o['id']==r['oe_id'])
 matches=[x for x in imported if x['request_code']==r['request_code'] and str(x['numero_oe'])==oe_number]
 imp=matches[0] if len(matches)==1 else None
 target=next((o for o in D['oifs'] if imp and o['id_oif']==imp['id_oif'] and o['numero_oif']==imp['oif_number'] and o['id_quadro']==imp['id_quadro']),None)
 valid_nf=[n['id'] for n in D['nfs'] if n['id'] in j(r['nf_ids_json']) and n['oe_id']==r['oe_id']]
 item=dict(id=r['id'],request_code=r['request_code'],oe_id=r['oe_id'],nf_ids=valid_nf,title=r['title'] or '',oe_status=r['status'] or '',oif_status=imp['status'] if imp else '',revision=r['revision'] or 0,return_revision=(imp['return_revision'] or 0) if imp else 0,board_nf_oe=r['board_nf'] or '',board_nf_oif=imp['board_nf'] if imp else '',id_oif=target['id_oif'] if target else None,id_quadro=target['id_quadro'] if target else None,oif_number=target['numero_oif'] if target else '',hmi_common=r['hmi_common'] or '',general_requirements=r['general_requirements'] or '',response_responsible=imp['response_responsible'] if imp else '',response_notes=imp['response_notes'] if imp else '')
 D['requests'].append(item)
 if imp:request_map[imp['id_request']]=r['id']
# Retain OIF-only requests independently, never infer a missing source request.
for imp in imported:
 if imp['id_request'] in request_map:continue
 oid=imp['id_oif'];target=next((o for o in D['oifs'] if o['id_oif']==oid and o['numero_oif']==imp['oif_number'] and o['id_quadro']==imp['id_quadro']),None)
 rid=100000+imp['id_request'];request_map[imp['id_request']]=rid
 D['requests'].append(dict(id=rid,request_code=imp['request_code'],oe_id=None,nf_ids=[],title=imp['title'] or '',oe_status='',oif_status=imp['status'],revision=imp['revision'] or 0,return_revision=imp['return_revision'] or 0,board_nf_oe='',board_nf_oif=imp['board_nf'] or '',id_oif=oid if target else None,id_quadro=target['id_quadro'] if target else None,oif_number=target['numero_oif'] if target else '',hmi_common='',general_requirements='',response_responsible=imp['response_responsible'] or '',response_notes=imp['response_notes'] or ''))
stock={r['id_artigo']:r for r in rows(b,'stock')}
for r in rows(b,'artigos'):
 item=pick(r,'id_artigo codigo codigo_interno descricao marca referencia_fabricante categoria unidade stock_minimo stock_maximo custo_interno_unitario');item['ativo']=bool(r['ativo']);s=stock.get(r['id_artigo'],{});item['stock_registado']=r['id_artigo'] in stock;item.update(quantidade=s.get('quantidade',0),quantidade_reservada=s.get('quantidade_reservada',0),origem='Cadastro de artigos OIF');D['articles'].append(item)
for r in rows(b,'movimentos_stock'):
 item=pick(r,'id_movimento id_artigo tipo quantidade documento_origem observacoes data_movimento');target=next((o for o in D['oifs'] if o['numero_oif']==r['documento_origem']),None);item['id_oif']=target['id_oif'] if target else None;D['stockMovements'].append(item)
for r in rows(b,'materiais_oif'):D['materials'].append(pick(r,'id_material_oif id_oif id_artigo quantidade_necessaria quantidade_reservada quantidade_em_falta custo_unitario_snapshot'))
for r in rows(b,'quadro_materiais_editaveis'):
 item=pick(r,'id_linha id_quadro codigo descricao marca referencia quantidade unidade pagina custo_unitario_aplicado');item['id_artigo']=r['id_artigo'];item['confirmado']=bool(r['confirmado']);D['panelMaterials'].append(item)
D['timeline']=[pick(r,'id_evento id_oif evento estado detalhe data_hora') for r in rows(b,'oif_linha_tempo')]
for r in rows(b,'fornecedores'):
 item=pick(r,'id_fornecedor codigo nome nif email telefone morada');item['ativo']=bool(r['ativo']);D['suppliers'].append(item)
for r in rows(b,'artigo_fornecedor'):
 item=pick(r,'id_artigo_fornecedor id_artigo id_fornecedor referencia_fornecedor preco_unitario prazo_entrega_dias');item['fornecedor_preferencial']=bool(r['fornecedor_preferencial']);D['supplierArticles'].append(item)
lines=rows(b,'encomenda_linhas')
for r in rows(b,'encomendas_fornecedor'):
 item=pick(r,'id_encomenda numero_encomenda id_fornecedor estado data_encomenda observacoes');item['id_oif']=r['id_oif'];item['lines']=[pick(l,'id_artigo quantidade preco_unitario data_prevista_entrega') for l in lines if l['id_encomenda']==r['id_encomenda']];D['purchases'].append(item)
receipt_lines=rows(b,'rececao_encomenda_linhas')
for r in rows(b,'rececoes_encomenda'):
 item=pick(r,'id_rececao id_encomenda guia_fornecedor data_rececao observacoes');item['lines']=[pick(l,'id_linha_rececao id_artigo quantidade_recebida') for l in receipt_lines if l['id_rececao']==r['id_rececao']];D['receipts'].append(item)
# Audit references resolve only to surviving entities; deleted historical rows
# remain visible without creating links to current records with reused IDs.
def audit_detail(value):
 return re.sub(r'(?:\\\\[^\s]+|[A-Za-z]:[\\/][^\n]+)','[caminho local omitido]',text(value))
for r in rows(a,'audit_log'):
 kind=text(r['entity_type']).lower();targets=D['oes'] if kind=='oe' else D['nfs'] if kind=='nf' else []
 target=next((x for x in targets if x['id']==r['entity_id']),None)
 D['auditHistory'].append(dict(id=f'oe-{r["id"]}',source='oe',entity_type=text(r['entity_type']),identifier=target['numero'] if target else text(r['entity_id']),action=text(r['action']),details=audit_detail(r['details']),created_at=text(r['created_at']),target_type=kind if target else None,target_id=target['id'] if target else None))
audit_lookup={'OIF':('oif','oifs','numero_oif','id_oif'),'QUADRO':('panel','panels','codigo','id_quadro'),'ARTIGO':('article','articles','codigo','id_artigo'),'FORNECEDOR':('supplier','suppliers','codigo','id_fornecedor'),'ENCOMENDA':('purchase','purchases','numero_encomenda','id_encomenda')}
for r in rows(b,'historico_alteracoes'):
 lookup=audit_lookup.get(text(r['entidade']).upper());target=None
 if lookup:target=next((x for x in D[lookup[1]] if x[lookup[2]]==r['identificador']),None)
 D['auditHistory'].append(dict(id=f'oif-{r["id_historico"]}',source='oif',entity_type=text(r['entidade']),identifier=text(r['identificador']),action=text(r['acao']),details=audit_detail(r['detalhe']),created_at=text(r['data_hora']),target_type=lookup[0] if target else None,target_id=target[lookup[3]] if target else None))
# Resolve stored Windows references only within approved supplied document folders.
# Basename fallback is accepted only if unique, never through production shares.
roots=[OE/'Documentos_NF',OE/'PDF_OE',OE/'OE_PDF',OIF/'desenhos',OIF/'integracao_oe',OIF/'documentos']
roots += [p for p in OE.iterdir() if p.is_dir() and p.name.startswith('OE_') and p.name!='OE_PDF']
file_index={}
for root in roots:
 if root.is_dir():
  for p in root.rglob('*'):
   if p.is_file():file_index.setdefault(p.name.casefold(),[]).append(p.resolve())
def resolve(stored):
 name=str(stored or '').replace('\\','/').split('/')[-1]
 if not name:return None
 candidates=file_index.get(name.casefold(),[])
 return candidates[0] if len(candidates)==1 else None
registry={}
def doc_category(kind,r,returned):
 section=text(r.get('section'));doctype=text(r.get('doc_type')).casefold()
 if section.startswith('Dossier Final - '):return section.removeprefix('Dossier Final - ').strip()
 if kind in ('request','panel') or returned or 'eletrica' in section.casefold() or 'oif' in section.casefold():return '06_Eletrica_Automacao'
 if doctype=='certificado':return '04_Certificados'
 if kind=='nf':return '07_Equipamentos_NF'
 return '10_Outros'
def adddoc(id,kind,owner,r,stored,source=None,returned=False,return_revision=0):
 p=resolve(stored);name=str(r.get('original_name') or stored or '').replace('\\','/').split('/')[-1]
 pdf=(p.suffix.lower()=='.pdf') if p else name.lower().endswith('.pdf')
 D['documents'].append(dict(id=id,owner_type=kind,owner_id=owner,doc_type=r.get('doc_type') or 'Documento',description=r.get('description') or 'Documento técnico',section=r.get('section') or 'Documentação',name=name,availability='available' if p and pdf else 'missing',pdf=pdf,source=source or ('nf' if kind=='nf' else 'oe' if kind=='oe' else 'oif'),category=doc_category(kind,r,returned),returned_to_oe=returned,return_revision=return_revision))
 if p and pdf:registry[id]=str(p)
for t,kind,key in [('oe_documents','oe','oe_id'),('nf_documents','nf','nf_id')]:
 for r in rows(a,t):
  returned=next((request for request in rows(a,'electrical_requests') if request['status']!='ELIMINADA' and request['return_pdf'] and request['return_pdf']==r['stored_path']),None) if kind=='oe' else None
  adddoc(f'{kind}-{r["id"]}',kind,r[key],r,r['stored_path'],source='oif' if returned else kind,returned=bool(returned),return_revision=(returned['last_return_revision'] or 0) if returned else 0)
for r in rows(b,'oe_electrical_documents'):
 if r['id_request'] in request_map:
  request=next(x for x in D['requests'] if x['id']==request_map[r['id_request']]);returned=request['return_revision']>0
  adddoc(f'req-doc-{r["id_document"]}','request',request_map[r['id_request']],r,r['stored_path'],source='oif',returned=returned,return_revision=request['return_revision'] if returned else 0)
# Original imported request PDFs have their own explicit source_pdf reference.
for r in rows(b,'oe_electrical_requests'):
 if r['id_request'] in request_map and r['source_pdf']:
  adddoc(f'req-source-{request_map[r["id_request"]]}','request',request_map[r['id_request']],dict(description=f'Folha elétrica recebida pelo OIF R{int(r["revision"] or 0):02d}'),r['source_pdf'],source='oif')
for r in rows(a,'electrical_requests'):
 if r['status']=='ELIMINADA':continue
 for key,desc in [('outgoing_pdf','Folha elétrica enviada'),('return_pdf','Folha elétrica devolvida')]:
  if r[key]:adddoc(f'req-{r["id"]}-{key}','request',r['id'],dict(description=desc),r[key],source='oif' if key=='return_pdf' else 'oe',returned=key=='return_pdf',return_revision=r['last_return_revision'] or 0 if key=='return_pdf' else 0)
for r in rows(b,'quadros_eletricos'):
 if r['caminho_esquema_pdf']:adddoc(f'panel-{r["id_quadro"]}','panel',r['id_quadro'],dict(description='Esquema elétrico SEE',doc_type='Desenho'),r['caminho_esquema_pdf'])
a.close();b.close()
out=BASE/'.local-data';out.mkdir(mode=0o700,exist_ok=True)
for filename,data in [('dataset.json',D),('documents.json',dict(files=registry,roots=[str(r.resolve()) for r in roots]))]:
 path=out/filename;path.write_text(json.dumps(data,ensure_ascii=False));os.chmod(path,0o600)
print('Snapshot privado extraído em modo read-only: '+', '.join(f'{len(D[k])} {k}' for k in ['oes','nfs','requests','oifs','panels','articles','documents']))
print('PDFs locais existentes e únicos:',len(registry))
