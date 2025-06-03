# Paratoi data: Setiau data newydd

Mae setiau data yn cynnwys set o ystadegau a’u metadata cysylltiedig. Caiff y set ddata ei hadeiladu yn SC3 fel ciwb data o dabl data a data cyfeirio neu am-edrych.

## Tablau data

Ar gyfer setiau data newydd, bydd angen i chi gael tabl data. Yn ddelfrydol, dylai’r tabl fod mewn [ffurf CSV](#guidance-fformat-y-ffeil) ac mae’n rhaid iddo gynnwys colofnau ar gyfer:

- gwerthoedd data (gan gynnwys rhesi ar gyfer unrhyw [gyfansymiau neu gyfartaleddau](#guidance-cyfansymiau-a-chyfartaleddau) wedi’u cyfrifo yr ydych yn dymuno eu cynnwys)
- yr holl ddimensiynau a’r [codau cyfeirio](#guidance-data-cyfeirio) perthnasol
- [mathau data neu fesur](#guidance-mathau-data-neu-fesur)
- codau nodiadau [llaw-fer safonol](#guidance-nodiadau) er mwyn labelu gwerthoedd data penodol - **rhaid i chi gynnwys y golofn hon**, hyd yn oed os nad oes gennych chi unrhyw godau nodiadau i’w cynnwys

Yn y canllaw hwn, byddwn yn defnyddio sefyllfa enghreifftiol data ar gyfer bandiau treth gyngor. Dyma resi enghreifftiol tabl data ar gyfer y sefyllfa hon:

| CodArdal  | CodBlwyddyn | CodBand | CodNodiadau | Mesur | Data   |
| :-------- | :---------- | :------ | :---------- | :---- | :----- |
| W06000001 | 202425      | A-      |             | 1     | 256.88 |
| W06000001 | 202425      | A       | x           | 1     |        |
| W06000001 | 202425      | B       |             | 1     | 359.64 |
| W06000001 | 202425      | C       | e           | 1     | 411.01 |
| W06000001 | 202425      | D       |             | 1     | 462.39 |

### Fformat y ffeil

Y fformat a ffefrir ar gyfer ffeil yw CSV gyda:

- gwerthoedd wedi’u gwahanu gyda chomas
- penawdau yn y rhes gyntaf
- " " yn cael eu defnyddio ar gyfer dyfynodau, yn ôl yr angen
- colofnau mewn unrhyw drefn
- gwerthoedd data rhifol – gall y rhain gynnwys pwyntiau degol a symbolau minws ond ni chânt gynnwys unrhyw nodau eraill fel comas neu arwyddion canran

Os bydd gwerth data ar ddim ar gael neu heb fod yn berthnasol, dylech:

- adael y gell yn wag
- nodi [cod nodyn safonol](#guidance-nodiadau) yn y golofn codau nodiadau, gan nodi a yw'r gwerth data ar ddim ar gael (x) neu heb fod yn berthnasol (z)

Y fformat a ffefrir ar gyfer CSVs yw UTF-8, gan bod hwn yn gweithio’n well gydag unrhyw nodau arbennig a ddefnyddir. Dylai’r fformat hwn fod yn ddewis yn y feddalwedd yr ydych chi’n ei defnyddio er mwyn creu CSVs, ac fe allai fod dan ‘amgodio testun’ neu rywbeth tebyg. Yn Excel, mae 'CSV UTF-8' dan fformatau cyffredin yn newis 'Save as'.

Er mai CSVs yw’r fformat a argymhellir, gall y system dderbyn fformatau JSON, Parquet a Excel XLSX hefyd.

### Penawdau

Dylai enwau penawdau colofnau fod yn ystyrlon, fel eich bod yn gwybod yr hyn y mae pob colofn yn ei gynnwys. Bydd hyn yn bwysig wrth [lanlwytho eich CSV](Using-SW3---Creating-a-new-dataset) i SC3. Gallant gynnwys bylchau rhwng geiriau yn ôl y gofyn.

### Ffeithiau anghyflawn neu ddyblyg

Mae ffaith yn gyfuniad unigryw o werthoedd dimensiynol mewn 1 rhes o'r tabl data. Er enghraifft, CodArdal W06000001, CodBlwyddyn 202425, CodBand A- a Mesur 1. Dim ond un gwerth data unigol sy'n gallu bod am bob ffaith unigryw.

Ni all y tabl data gynnwys ffeithiau anghyflawn. Rhaid llenwi pob ffaith ar gyfer pob dimensiwn, ac eithrio [codau nodiadau](#guidance-nodiadau) a gwerthoedd data, y dylid eu llenwi mewn ffordd briodol.

Os byddwch yn lanlwytho tabl data gyda ffeithiau anghyflawn neu ddyblyg, bydd y system yn nodi pa ffeithiau y bydd angen eu gwaredu neu eu cywiro.”

### Cyfansymiau a chyfartaleddau

Dylech gynnwys rhesi yn eich tabl data ar gyfer unrhyw gyfansymiau neu gyfartaleddau yr hoffech eu cynnwys gyda’r set ddata. Mae hyn yn cynnwys unrhyw is-gyfansymiau a chyfansymiau terfynol. Dylai’r rhesi gynnwys:

- cyfansymiau neu gyfartaleddau
- [codau cyfeirio](#guidance-data-cyfeirio) neu [fformatau dyddiad](#guidance-fformatio-dyddiadau) cywir
- [cod nodiadau safonol](#guidance-nodiadau) sy’n dynodi a yw’r gwerth data yn gyfanswm (t) neu’n gyfartaledd (a)

Yn ein henghraifft am dreth gyngor, mae’r dimensiwn CodArdal yn cyfeirio at awdurdodau lleol. Pe byddech yn dymuno cynnwys cyfanswm neu gyfartaledd ar gyfer Cymru gyfan, byddai angen i chi gynnwys rhes a fyddai’n cynnwys:

- y cyfanswm neu’r cyfartaledd
- y cod cyfeirio i Gymru [W92000004]
- cod nodiadau ‘t’ neu 'a'

Os yw eich data yn cynnwys hierarchaethau lluosog, gallwch ddarparu cyfansymiau neu gyfartaleddau lluosog. Er enghraifft, cyfanswm ar gyfer pob rhanbarth economaidd a chyfanswm i Gymru.

### Rhoi colofnau mewn trefn

Bydd trefn y colofnau yn eich ffeil tabl data yn effeithio ar drefn y tabl data y bydd defnyddwyr yn ei lawrlwytho. Bydd y drefn hon yn seiliedig ar y drefn ddidoli a ddiffinnir gan ddata cyfeirio pob dimensiwn. Yn ein henghraifft uchod gan ddefnyddio treth gyngor, byddai’r tabl data yn cael ei ddidoli yn gyntaf fesul awdurdod lleol (CodArdal), yna blwyddyn (CodBlwyddyn), yna band treth gyngor (CodBand), yna mesur.

## Data cyfeirio

Pan fyddwch yn creu eich set ddata yn SC3, bydd angen i chi ddewis data cyfeirio ar gyfer pob dimensiwn yn eich tabl data. Yn ein tabl enghreifftiol, byddai hyn yn golygu dewis tablau am-edrych ar gyfer ‘CodArdal’ ac ar gyfer ‘CodBand’, a chadarnhau fformatau dyddiad ar gyfer ‘CodBlwyddyn’. Nid oes angen i chi ychwanegu tablau am-edrych ar gyfer [nodiadau gwerthoedd data](#guidance-nodiadau).

### Data cyfeirio safonol

Mae data cyfeirio safonol a reolir yn ganolog yn helpu:

- sicrhau gwell cysondeb ar draws StatsCymru
- safoni disgrifiadau Cymraeg a Saesneg
- gwella defnyddioldeb i ddefnyddwyr data

Ar hyn o bryd, mae gan SC3 ddata cyfeirio safonol a reolir yn ganolog ar gyfer daearyddiaeth yn unig.

Nid yw SC3 yn defnyddio tablau am-edrych ar gyfer dimensiynau sy’n cynnwys dyddiadau. Yn hytrach, ceir [dull gweithredu safonol tuag at fformatio](#guidance-fformatio-dyddiadau).

Ar gyfer unrhyw fath dimensiwn arall, dylech [baratoi eich tabl am-edrych eich hun](#guidance-tablau-am-edrych), gydag eithriadau posibl ar gyfer rhai [dimensiynau sy&#39;n cynnwys testun neu rifau](#guidance-dimensiynau-sy'n-cynnwys-testun-neu-rifau-lle-nad-oes-gofyn-cael-tabl-am-edrych).

### Daearyddiaeth

Mae’r system yn cynnwys tablau am-edrych safonol ar gyfer pob daearyddiaeth gyffredin a ddefnyddir, fel y darparir gan [porth Open Geography SYG](https://geoportal.statistics.gov.uk/). Gallwch lawrlwytho’r tablau am-edrych hyn fel CSVs o [adran ‘Data cyfeirio’](#) y gwasanaeth hwn. Rhaid i chi ddefnyddio’r codau yn y tablau hyn wrth greu eich tablau data chi.

Ni fydd angen i chi lanlwytho’r tablau am-edrych safonol hyn pan fyddwch yn creu eich set ddata yn SW3. Dim ond dweud wrth y system pa ddaearyddiaeth yr ydych chi wedi’i defnyddio y bydd angen i chi ei wneud.

Efallai y bydd amgylchiadau prin pan na fydd y tablau safonol yn cynnwys y data priodol ar gyfer eich set ddata. Er enghraifft, os bydd angen i chi gyfuno ardaloedd daearyddol penodol am resymau cyfrinachedd. Yn yr achosion hyn, dylech [baratoi eich tablau am-edrych eich hun](#guidance-tablau-am-edrych).

Bydd angen i chi nodi’r rheswm pam nad ydych chi wedi defnyddio tabl safonol hefyd. Bydd y rheswm hwn yn weladwy i’r defnyddiwr fel rhan o’r adran metadata ‘Ardaloedd daearyddol sydd wedi’u cynnwys’.

### Fformatio dyddiadau

Pan fyddwch yn creu eich set ddata yn SC3, bydd angen i chi [nodi’r fformatau dyddiadau yr ydych chi wedi’u defnyddio](Using-SW3---Creating-a-new-dataset#guidance-cwestiynau-am-ffurf-y-dyddiadau) yn eich tabl data. Dim ond fformatau dyddiadau penodol y gall SC3 eu derbyn.

#### Pwyntiau penodol mewn amser

Er enghraifft, dyddiadau penodol pan gasglwyd gwerthoedd data.

| Fformat yn y tabl data | Enghraifft | Sut y bydd yn ymddangos ar y wefan |
| :--------------------- | :--------- | :--------------------------------- |
| DD/MM/YYYY             | 01/01/2022 | 1 Ionawr 2022                      |
| DD-MM-YYYY             | 01-01-2022 | 1 Ionawr 2022                      |
| YYYY-MM-DD             | 2022-01-01 | 1 Ionawr 2022                      |
| YYYYMMDD               | 20220101   | 1 Ionawr 2022                      |

#### Cyfnodau amser

Er enghraifft, misoedd, chwarteri neu flynyddoedd y mae gwerthoedd data yn berthnasol iddynt.

##### Fformatau blwyddyn

| Fformat yn y tabl data | Enghraifft | Sut y bydd yn ymddangos ar y wefan |
| :--------------------- | :--------- | :--------------------------------- |
| YYYYYYYY               | 20222023   | 2022-23                            |
| YYYY-YYYY              | 2022-2023  | 2022-23                            |
| YYYY/YYYY              | 2022/2023  | 2022/23                            |
| YYYYYY                 | 202223     | 2022-23                            |
| YYYY-YY                | 2022-23    | 2022-23                            |
| YYYY/YY                | 2022/23    | 2022/23                            |
| YYYY                   | 2022       | 2022                               |

##### Fformatau chwarter

Unrhyw rai o’r fformatau blwyddyn, wedi’u dilyn gan god chwarter.

| Fformat chwarter yn y tabl data | Enghraifft | Sut y bydd yn ymddangos ar y wefan |
| :------------------------------ | :--------- | :--------------------------------- |
| Qx                              | 2022Ch1    | Ch1 2022                           |
| \_Qx                            | 2022_Ch1   | Ch1 2022                           |
| \-Qx                            | 2022-Ch1   | Ch1 2022                           |
| x                               | 20221      | Ch1 2022                           |
| \_x                             | 2022_1     | Ch1 2022                           |
| \-x                             | 2022-1     | Ch1 2022                           |

##### Fformatau mis

Unrhyw rai o’r fformatau blwyddyn, wedi’u dilyn gan god mis.

| Fformat mis yn y tabl data | Enghraifft | Sut y bydd yn ymddangos ar y wefan |
| :------------------------- | :--------- | :--------------------------------- |
| MMM                        | 2022Jan    | Ionawr 2022                        |
| mMM                        | 2022m01    | Ionawr 2022                        |
| MM                         | 202201     | Ionawr 2022                        |

##### Math blwyddyn

Bydd angen i chi wybod y math o flwyddyn y mae’r dimensiwn yn ei gynnwys hefyd, naill ai:

- calendr (1 Ionawr i 31 Rhagfyr)
- meteorolegol (1 Mawrth i 28 neu 29 Chwefror)
- ariannol (1 Ebrill i 31 Mawrth)
- treth (6 Ebrill i 5 Ebrill)
- academaidd (1 Medi i 31 Awst)
- arall (unrhyw ddyddiad cychwyn arall)

Ni all y system ymdopi â blynyddoedd treigl ar hyn o bryd. Caiff y canllawiau hyn eu diweddaru ar ôl ychwanegu'r swyddogaeth hon.

Os nad ydych chi'n gwybod y math o flwyddyn y mae'r dimensiwn yn ymwneud â hi, dylech gysylltu â'r casglwr data ar gyfer eich set ddata.

##### Cyfnodau lluosog yn yr un set ddata

Gall eich set ddata gynnwys data ar gyfer cyfnodau amser lluosog. Er enghraifft, gwerthoedd misol gyda chyfansymiau chwarterol a blynyddol.

**Rhaid i chi ddefnyddio fformatio blwyddyn cyson** ar gyfer yr holl gyfnodau amser sy’n bresennol yn y set ddata. Er enghraifft, os ydych chi’n defnyddio ‘YYYY’ ar gyfer blynyddoedd, gallech ddefnyddio ‘YYYYQx’ ar gyfer chwarteri a 'YYYYMM' ar gyfer misoedd.

##### Cyfnodau ansafonol

Efallai y bydd amgylchiadau prin pan na fydd y ffurfiau safonol hyn yn briodol ar gyfer y data yn eich set ddata. Er enghraifft, os na fydd cyfnodau yn barhaus ac os byddant yn cynnwys rhannau o flynyddoedd penodol yn unig. Yn yr achosion hyn, dylech [baratoi eich tablau am-edrych data eich hun](#guidance-tablau-am-edrych-dyddiad).

Bydd angen i chi nodi’r rheswm dros eich penderfyniad i beidio defnyddio’r ffurf safonol hefyd. Bydd y rheswm hwn yn weladwy i’r defnyddiwr fel rhan o adran metadata ‘Cyfnod amser dan sylw’.

### Tablau am-edrych

Ar gyfer dimensiynau nad ydynt yn cynnwys dyddiadau neu ddaearyddiaeth, dylech baratoi eich tablau am-edrych eich hun. Byddwch yn lanlwytho’r rhain i SC3.

Mae tabl am-edrych yn dweud wrth y system yr hyn y mae pob un o’r codau cyfeirio a ddefnyddir mewn dimensiwn perthnasol yn ei gynrychioli. Mae’n bwysig bod y codau cyfeirio yn y dimensiwn yn y tabl data yn **cyfateb yn union** â’r rhai yn y tabl am-edrych.

Yn ddelfrydol, dylai eich tabl am-edrych fod mewn [fformat CSV](#guidance-fformat-y-ffeil) ac yn un o’r fformatau canlynol.

#### Fformat 2-rhes (a ffefrir)

| Pennawd      | Yr hyn y mae’r golofn yn ei gynnwys                                              | Wastad yn ofynnol                                         |
| :----------- | :------------------------------------------------------------------------------- | :-------------------------------------------------------- |
| codcyf       | Codau cyfeirio                                                                   | <strong class="govuk-tag govuk-tag--green">Oes</strong>   |
| disgrifiad   | Disgrifiad                                                                       | <strong class="govuk-tag govuk-tag--green">Oes</strong>   |
| iaith        | Iaith a ddefnyddir, naill ai 'en' neu 'cy'                                       | <strong class="govuk-tag govuk-tag--green">Oes</strong>   |
| hierarchaeth | Dynodi os yw gwerth yn gysylltiedig â gwerthoedd eraill mewn ffordd hierarchaidd | <strong class="govuk-tag govuk-tag--red">Nac oes</strong> |
| trefn        | Trefn ddidoli                                                                    | <strong class="govuk-tag govuk-tag--red">Nac oes</strong> |
| nodyn        | Nodiadau                                                                         | <strong class="govuk-tag govuk-tag--red">Nac oes</strong> |

Enghraifft o rhan o dabl am-edrych ar gyfer cod band treth:

| codcyf | disgrifiad    | iaith | trefn |
| :----- | :------------ | :---- | :---- |
| A-     | Tax band A-   | en    | 1     |
| A-     | Band treth A- | cy    | 1     |
| A      | Tax band A    | en    | 2     |
| A      | Band treth A  | cy    | 2     |
| B      | Tax band B    | en    | 3     |

#### Fformat rhes unigol

| Pennawd       | Yr hyn y mae’r golofn yn ei chynnwys                                             | Wastad yn ofynnol                                         |
| :------------ | :------------------------------------------------------------------------------- | :-------------------------------------------------------- |
| codcyf        | Codau cyfeirio                                                                   | <strong class="govuk-tag govuk-tag--green">Oes</strong>   |
| disgrifiad_en | Disgrifiad (Saesneg)                                                             | <strong class="govuk-tag govuk-tag--green">Oes</strong>   |
| disgrifiad_cy | Disgrifiad (Cymraeg)                                                             | <strong class="govuk-tag govuk-tag--green">Oes</strong>   |
| hierarchaeth  | Dynodi os yw gwerth yn gysylltiedig â gwerthoedd eraill mewn ffordd hierarchaidd | <strong class="govuk-tag govuk-tag--red">Nac oes</strong> |
| trefn         | Trefn ddidoli                                                                    | <strong class="govuk-tag govuk-tag--red">Nac oes</strong> |
| nodyn_en      | Nodiadau (Saesneg)                                                               | <strong class="govuk-tag govuk-tag--red">Nac oes</strong> |
| nodyn_cy      | Nodiadau (Cymraeg)                                                               | <strong class="govuk-tag govuk-tag--red">Nac oes</strong> |

Enghraifft o rhan o dabl am-edrych ar gyfer cod band treth:

| codcyf | disgrifiad_en | disgrifiad_cy | trefn |
| :----- | :------------ | :------------ | :---- |
| A-     | Tax band A-   | Band treth A- | 1     |
| A      | Tax band A    | Band treth A  | 2     |
| B      | Tax band B    | Band treth B  | 3     |
| C      | Tax band C    | Band treth C  | 4     |
| D      | Tax band D    | Band treth D  | 5     |

#### Penawdau colofnau

Mae’n bwysig bod y **penawdau colofnau penodol hyn** yn cael eu defnyddio.

#### Hierarchaethau

Defnyddiwch y golofn 'hierarchaeth' i ddynodi a yw gwerth dimensiwn yn is na gwerth arall mewn ffordd hierarchaidd. Er enghraifft, pe bai bandiau treth yn cael eu rhannu i is-fandiau megis 'A1', 'A2' ac 'A3', byddai'r golofn 'hierarchaeth' ar gyfer pob un o'r is-fandiau hyn yn cynnwys 'A'. Dim ond codau cyfeirio a ddefnyddir yng ngholofn 'codcyfeirio' y dylai'r golofn 'hierarchaeth' eu cynnwys.

Rhan enghreifftiol o dabl am-edrych am godau bandiau treth sydd â hierarchaeth 3-lefel:

| codcyf | disgrifiad_en | disgrifiad_cy  | hierarchaeth | trefn |
| :----- | :------------ | :------------- | :----------- | :---- |
| A      | Tax band A    | Band treth A   |              | 14    |
| A1     | Tax band A1   | Band treth A1  | A            | 15    |
| A1a    | Tax band A1a  | Band treth A1a | A1           | 16    |
| A1b    | Tax band A1b  | Band treth A1b | A1           | 17    |
| A1c    | Tax band A1c  | Band treth A1c | A1           | 18    |

Nid oes cyfyngiad o ran sawl lefel y gall hierarchaeth eu cynnwys. Fodd bynnag, dim ond at un gwerth uwch ei ben yn yr hierarchaeth y gall gwerth dimensiwn ymwneud ag ef. Er enghraifft, ni fyddai modd i is-fand 'A1' eistedd dan 'A' ac 'A-'.

Os oes gennych chi hierarchaeth nad ydych yn gwybod sut i'w gweithredu, anfonwch e-bost at richard.davies3@gov.wales i ofyn am gymorth.

#### Disgrifiadau

Dylai disgrifiadau o’r holl werthoedd dimensiwn fod yn:

- gryno ac esbonio’n glir yr hyn y mae’r gwerth dimensiwn yn ei gynrychioli
- mewn llythrennau ar ffurf brawddeg, ac eithrio enwau priod, er enghraifft ‘Dosau a neilltuwyd i Gymru'
- unigryw ac yn wahanol i’w gilydd
- darparir yn Gymraeg ac yn Saesneg

#### Nodiadau tabl am-edrych

Gellir darparu nodiadau tabl am-edrych, ond **nid ydynt yn cael eu dangos yn yr hyn y mae’r defnyddiwr yn ei weld ar hyn o bryd** yn SC3. Os yw nodiadau yn cynnwys gwybodaeth bwysig, dylech sicrhau bod y wybodaeth hon yn cael ei darparu yn yr [adran metadata](#guidance-metadata) mwyaf priodol hefyd.

#### Tablau am-edrych dyddiad

Yn yr achosion prin pan fydd angen i chi lanlwytho tabl am-edrych dyddiad, dylai hwn fod yn yr un ffurf â thablau am-edrych eraill, gyda’r colofnau ychwanegol canlynol:

| Pennawd | Yr hyn y mae’r golofn yn ei gynnwys                                   |
| :------ | :-------------------------------------------------------------------- |
| cychwyn | Dyddiad y mae’r cyfnod yn cychwyn mewn ffurf ISO, yyyy-mm-ddThh:mm:ss |
| gorffen | Dyddiad y mae’r cyfnod yn gorffen mewn ffurf ISO, yyyy-mm-ddThh:mm:ss |

Enghraifft tabl am-edrych dyddiad:

| codcyf | cychwyn    | gorffen    | trefn | disgrifiad_en | disgrifiad_cy |
| :----- | :--------- | :--------- | :---- | :------------ | :------------ |
| 2022   | 2022-06-01 | 2022-08-31 | 1     | Summer 2022   | Haf 2022      |
| 2023   | 2023-06-01 | 2023-08-31 | 2     | Summer 2023   | Haf 2023      |
| 2024   | 2024-06-01 | 2024-08-31 | 3     | Summer 2024   | Haf 2024      |

### Dimensiynau sy'n cynnwys testun neu rifau lle nad oes gofyn cael tabl am-edrych

Nid oes gofyn cael tabl am-edrych os gellir defnyddio'r gwerthoedd dimensiwn a ddefnyddir yn y tabl data fel disgrifiadau yn uniongyrchol. Mae hyn yn wir dim ond:

- os yw gwerthoedd dimensiwn yn cynnwys llythrennau, rhifau neu symbolau sydd yr un fath yn Gymraeg ac yn Saesneg
- os nad oes angen nodi trefn ddidoli
- os nad oes angen hierarchaethau a nodiadau

Er enghraifft, yn ein henghraifft treth gyngor, os mai dim ond 'A', 'B' ac ati yr oedd angen i'r disgrifiadau fod, yn hytrach na 'Band treth A', 'Band treth B' ac ati. Neu fel enghraifft arall, os defnyddir yr oedran mewn blynyddoedd fel gwerthoedd dimensiwn, megis '18', '19' ac ati.

### Enwau dimensiynau

Pan fyddwch yn ychwanegu data cyfeirio yn SC3, bydd angen i chi ychwanegu’r hyn yr ydych yn dymuno i’r dimensiwn gael ei alw ar yr ochr i ddefnyddwyr.

Dylai enwau dimensiynau fod yn:

- gryno ac esbonio’n glir yr hyn y mae’r dimensiwn yn ei gynnwys
- mewn llythrennau ar ffurf brawddeg, ac eithrio enwau priod, er enghraifft ‘Awdurdodau lleol’

## Mathau data neu fesur

Mae mesur, neu fath data, yn dynodi’r hyn y mae’r gwerth data yn ei gynrychioli. **Rhaid** i chi gynnwys colofn ar gyfer hyn yn eich tabl data, hyd yn oed os yw eich set ddata yn cynnwys un math o fesur yn unig. Mae cynnwys mesurau yn helpu defnyddwyr i ddeall y data yn eich set ddata yn well.

Ar gyfer dimensiwn sy’n cynnwys mesurau, dylech baratoi eich tabl am-edrych eich hun. Byddwch yn lanlwytho hwn i SC3. Dylai fod yn yr un fformat â [thablau am-edrych](#guidance-tablau-am-edrych) eraill, gyda’r colofnau ychwanegol canlynol:

| Pennawd | Yr hyn y mae’r golofn yn ei gynnwys                                                                                                                                                                                                                                                                             |
| :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| math    | Unrhyw rai o’r canlynol: <ul><li>cyfrif</li><li>canran</li><li>cyfradd</li><li>safle</li><li>rhifiadur</li><li>enwadur</li><li>gwerth mynegai</li><li>modd</li><li>canolrif</li><li>cymedr</li><li>gwyriad safonol</li><li>amrywiant</li><li>chwartel</li><li>cwintel</li><li>degradd</li><li>canradd</li></ul> |
| fformat | Unrhyw rai o’r canlynol: <ul><li>degol</li><li>arnawf</li><li>cyfanrif</li><li>hir</li><li>canran</li><li>llinyn</li><li>testun</li><li>dyddiad</li><li>dyddiadamser</li><li>amser</li></ul>                                                                                                                    |
| degol   | Os nodwyd 'degol' neu 'arnawf' ar gyfer 'fformat':<ul><li>nodwch nifer y lleoedd degol i'w dangos</li><li>os na nodir unrhyw beth, caiff rhifau eu talgrynnu i'r rhif cyfan agosaf</li><ul>                                                                                                                     |

Tabl am-edrych mesur enghreifftiol ar gyfer ein henghraifft treth gyngor:

| codcyf | math   | fformat  | degol | trefn | disgrifiad_en              | disgrifiad_cy               |
| :----- | :----- | :------- | :---- | :---- | :------------------------- | :-------------------------- |
| 1      | cyfrif | degol    | 2     | 1     | Council tax in £           | Treth gyngor mewn £         |
| 2      | canran | canran   |       | 2     | % of median monthly salary | % y cyflog misol canolrifol |
| 3      | safle  | cyfanrif |       | 3     | Rank of council tax band   | Safle band treth gyngor     |

_Sylwer mai enghraifft yw hon at ddibenion arddangos, ac nad yw’n dabl am-edrych go iawn ar gyfer data treth gyngor._

## Nodiadau

### Nodiadau gwerthoedd data (troednodiadau a data coll yn flaenorol)

Dim ond os bydd angen gwneud hynny er mwyn deall y data y dylech chi ychwanegu nodyn i werth data penodol. Fodd bynnag, **rhaid i chi gynnwys colofn ar gyfer codau nodiadau** yn eich tabl data, hyd yn oed os nad oes gennych chi unrhyw godau nodiadau i’w cynnwys.

Mae SC3 yn defnyddio codau nodiadau llaw-fer, gydag esboniadau safonol, sy’n dilyn [safonau’r sector cyhoeddus](https://analysisfunction.civilservice.gov.uk/policy-store/symbols-in-tables-definitions-and-help/) yn agos. Nid yw’r codau yn gwahaniaethu rhwng priflythrennau a llythrennau bach.

| Llaw-fer | Ystyr                                               | Defnydd                                                                                                                                                                                                                            |
| :------- | :-------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a        | Cyfartaledd                                         | Pan fydd gwerth data yn gyfartaledd gwerthoedd eraill                                                                                                                                                                              |
| b        | Cyfres toriad amser                                 | Pan fydd toriad mewn cyfres data sy’n golygu na ellir cymharu data cyn y toriad gyda data ar ôl y toriad yn uniongyrchol                                                                                                           |
| c        | Gwybodaeth gyfrinachol                              | Er enghraifft, os bydd gwerth data wedi cael ei atal oherwydd y gallech chi adnabod manylion am bobl penodol o’r data. Sylwer nad oes unrhyw ffordd yn SC3 i guddio nac atal gwerthoedd, felly rhaid gwneud hyn yn eich tabl data. |
| e        | Amcangyfrifedig                                     | Pan fydd gwerth data yn werth amcangyfrifedig                                                                                                                                                                                      |
| f        | Rhagolwg                                            | Pan fydd gwerth data yn werth yn y dyfodol wedi’i gyfrifo yn hytrach na gwerth wedi’i arsylwi                                                                                                                                      |
| k        | Ffigwr isel                                         | Ffigwr isel sy’n ymddangos fel sero ar ôl talgrynnu                                                                                                                                                                                |
| ns       | Ddim yn arwyddocaol yn ystadegol                    | Pan na ellir pennu a yw gwerth data yn ddibynadwy neu beidio                                                                                                                                                                       |
| p        | Dros dro                                            | Pan na fydd gwerth data wedi cael ei gwblhau eto, neu disgwylir iddo gael ei newid                                                                                                                                                 |
| r        | Diwygiedig                                          | Pan fydd gwerth data wedi cael ei ddiwygio ers y cafodd ei gyhoeddi yn gyntaf                                                                                                                                                      |
| s        | Yn arwyddocaol yn ystadegol ar lefel 5% neu 0.05    | Pan fydd y siawns bod gwerth data yn annibynadwy yn llai na 5%                                                                                                                                                                     |
| ss       | Yn arwyddocaol yn ystadegol ar lefel 1% neu 0.01    | Pan fydd y siawns bod gwerth data yn annibynadwy yn llai nag 1%                                                                                                                                                                    |
| sss      | Yn arwyddocaol yn ystadegol ar lefel 0.1% neu 0.001 | Pan fydd y siawns bod gwerth data yn annibynadwy yn llai na 0.1%                                                                                                                                                                   |
| t        | Cyfanswm                                            | Pan fydd gwerth data yn gyfanswm gwerthoedd eraill                                                                                                                                                                                 |
| u        | Dibynadwyedd isel                                   | Pan fydd ansawdd ystadegol isel i werth data                                                                                                                                                                                       |
| x        | Ddim ar gael                                        | Er enghraifft, pan na chaiff gwerth data ei gasglu mewn rhanbarth                                                                                                                                                                  |
| z        | Heb fod yn berthnasol                               | Er enghraifft, mewn tablau cyflogaeth pan na ellir cyflogi pobl dan 16 oed yn gyfreithlon                                                                                                                                          |

Dylid darparu unrhyw esboniadau wedi’u haddasu yr ydych chi’n teimlo eu bod yn angenrheidiol er mwyn egluro unrhyw godau nodiadau, yn yr [adran metadata](#guidance-metadata) mwyaf priodol. Er enghraifft, os bydd angen i chi esbonio rhesymau lluosog pam bod gwerthoedd data wedi cael eu hatal.

Os bydd angen i chi ychwanegu codau nodiadau lluosog i un gwerth data, dylid gwahanu’r rhain gan ddefnyddio coma, er enghraifft ‘p,f’.

### Nodiadau eraill

Dylid darparu’r holl nodiadau eraill am ddimensiynau neu’r set ddata yn yr [adran metadata](#guidance-metadata) mwyaf priodol.

## Metadata

Cyn i chi greu set ddata newydd yn SC3, dylech baratoi’r holl fetadata cysylltiedig y bydd ei angen arnoch. Dylech ddarparu hwn **i gyd yn yr un iaith**. Dylai hyn fod ym mha bynnag iaith y byddwch yn ei defnyddio pan fyddwch yn defnyddio SC3, sef Cymraeg neu Saesneg. Caiff cyfieithiadau metadata i’r iaith arall eu [prosesu gyda’r holl gyfieithiadau eraill](Using-SW3---Creating-a-new-dataset#guidance-cyfieithiadau).

### Rhestrau bwled

Gallwch ddefnyddio pwyntiau bwled er mwyn helpu i gyflwyno cynnwys, yn ôl yr angen.

Dylech nodi seren wrth bwyntiau bwled a bwlch ar y dechrau. Er enghraifft:

'`* testun i ymddangos fel pwynt bwled`'

Bydd y system yn creu rhestrau o’r rhain a fydd yn defnyddio pwyntiau bwled cylchol.

Dylech:

- gadw at un frawddeg fesul bwled
- peidio gorffen pwyntiau bwled gydag atalnodau neu gysyllteiriau fel ‘neu’
- ceisio defnyddio gair gwahanol ar ddechrau pob pwynt bwled

Os ydych chi’n defnyddio llinell arweiniol i’ch rhestr pwyntiau bwled, dylai pob pwynt bwled ffurfio brawddeg gyflawn gyda’r linell arweiniol. Mae’r rhestr pwyntiau bwled uchod yn dangos hyn.

### Dolenni

Dylech ddarparu dolenni i adroddiadau cysylltiedig yn yr [adran adroddiadau cysylltiedig](#guidance-adroddiadau-cysylltiedig) pwrpasol. Dim ond yw hynny’n bwysig er mwyn deall y set ddata yn well y dylid cynnwys dolen mewn unrhyw rai o’r adrannau metadata sy’n seiliedig ar destun.

Os bydd angen i chi gynnwys dolen, dylech sicrhau eich bod yn eu defnyddio mewn ffordd briodol.

Dylech nodi dolenni gyda thestun y ddolen mewn cromfachau sgwâr, a ddilynir yn uniongyrchol gan URL y ddolen mewn cromfachau crwn. Er enghraifft:

'`[Llywodraeth Cymru](https://www.llyw.cymru)`'

Bydd y system yn creu dolen y bydd modd clicio arni, sef '[Llywodraeth Cymru](https://www.gov.wales)'. Rhaid i’r URL gychwyn gyda naill ai 'https://' neu 'http://'.

Dylai’r testun yn y ddolen:

- nodi’n glir yr hyn y bydd y defnyddiwr yn ei gael o’r ddolen
- osgoi cyfarwyddiadau fel “cliciwch yma” neu “i ddarganfod mwy”
- bod yn hirach nag 1 gair, ond nid yn frawddeg lawn
- ffurfio rhan o frawddeg, nid bod yn rhan o restr dolenni

### Adrannau metadata

Mae’r canlynol yn cynrychioli’r holl fetadata y bydd angen i chi ei ddarparu.

#### Teitl

Enw byr, disgrifiadol ac unigryw ar gyfer y set ddata ar gyfer gwefan StatsCymru. Bydd y system yn dweud wrthych os byddwch yn nodi teitl sydd eisoes yn cael ei ddefnyddio gan set ddata fyw, wedi’i chyhoeddi

#### Crynodeb

Mae hyn yn esbonio'r hyn y mae'r set ddata yn ymwneud ag ef a'r hyn y mae'n ei ddangos. Dylai:

- ddefnyddio brawddegau byr, syml
- disgrifio pa ddimensiynau a ddefnyddiwyd a pham
- heb fod yn hirach na 2-3 paragraff yn ddelfrydol
- peidio cynnwys unrhyw beth sy'n ymwneud â chasglu data neu ansawdd data – dylai hwn fod yn yr adran berthnasol yn lle hynny

#### Cyfrifo neu gasglu data

Mewn brawddegau byr a syml, esboniwch naill ai:

- y fethodoleg a ddefnyddiwyd i gasglu’r data
- y fethodoleg a ddefnyddiwyd i gyfrifo’r data
- y ddau uchod

#### Ansawdd ystadegol

Mewn brawddegau byr a syml, esboniwch unrhyw faterion neu newidiadau methodolegol sy’n ymwneud a’r set ddata, gan gynnwys unrhyw:

- nodiadau sy’n berthnasol i’r holl werthoedd data yn y set ddata
- esboniadau wedi’u haddasu sy’n angenrheidiol er mwyn egluro unrhyw godau nodiadau gwerthoedd data a ddefnyddiwyd

Os yw ar gael, gallwch gynnwys **crynodeb lefel uchel** o’r adroddiad ansawdd ystadegol. Dylech ychwanegu dolen i’r adroddiad yn yr adran ‘Adroddiadau cysylltiedig’, nid fel dolen yma.

##### Talgrynnu wedi’i wneud

Mae’r adran ansawdd ystadegol yn cynnwys is-adran hefyd er mwyn dynodi a oes unrhyw waith talgrynnu wedi cael ei wneud. Os oes, esboniwch hynny mewn brawddegau byr a syml.

#### Ffynonellau data

Rhennir hwn yn ddarparwyr data a ffynonellau data penodol. Darparwyr data yw'r sefydliadau sy'n cynnig mynediad i'r data yr ydych yn ei ddefnyddio i greu eich setiau data. Megis y 'Swyddfa Ystadegau Gwladol (SYG)'. Dylai'r darparwr data ddweud wrthych beth yw ffynhonnell benodol y data, megis 'Cyfrifiad 2021'.

Mewn rhai achosion, efallai y byddwch yn gwybod darparwr y data yn unig, ac nid ffynhonnell benodol gan y darparwr hwnnw. Er enghraifft, ‘Ymddygiad Iechyd mewn Plant Oedran Ysgol (HBSC)’.

Gallwch ychwanegu ffynonellau lluosog yn ôl y gofyn.

Caiff [rhestr y darparwyr data a’r ffynonellau \[link TBD\]](#) ei rheoli yn ganolog. Os bydd angen i chi ychwanegu darparwr data neu ffynhonnell i’r rhestr, bydd angen i chi:

- anfon e-bost at ... yn ... \[process TBD\]
- nodi enw’r darparwr data a’r ffynhonnell yn Gymraeg ac yn Saesneg

Byddwch yn cael eich hysbysu ar ôl i’r darparwr data a’r ffynhonnell gael eu hychwanegu i’r rhestr. Yna, byddwch yn gallu eu dewis yn SC3.

#### Adroddiadau cysylltiedig

Dylech ddarparu dolenni i unrhyw adroddiadau cysylltiedig, y gallent gynnwys:

- ystadegau a datganiadau i’r wasg LLYW.CYMRU
- adroddiadau ansawdd ystadegol
- gwaith cysylltiedig arall

Bydd angen i chi ddarparu URL yr adroddiad, a thestun y ddolen a fydd yn ymddangos ar y dudalen we. Dylai testun y ddolen fod yn deitl neu’n ddisgrifiad byr o’r adroddiad, nid yr URL. Dylai’r URL ddechrau gyda naill ai 'https://' or 'http://'.

Os oes gwahanol URLs ar gyfer yr adroddiad mewn gwahanol ieithoedd, dylech ddarparu’r ddau URL. Dylai testun y ddolen nodi’n glir ym mha iaith y mae adroddiad y ddolen ynddi. Er enghraifft, efallai y byddwch yn ychwanegu’r ddwy ddolen hon:

- GOV.WALES statistics and research releases (English)
- ystadegau a datganiadau ymchwil LLYW.CYMRU (Cymraeg)

#### Pa mor aml y caiff y set ddata ei diweddaru

Nodwch a fydd y set ddata yn cael ei diweddaru’n rheolaidd neu beidio \- naill ai oherwydd ei fod yn ddata untro neu os yw’r gwaith o’i ddiweddaru wedi stopio. Gallwch nodi’r cyfnod rhwng diweddariadau mewn diwrnodau, wythnosau, misoedd, chwarteri neu flynyddoedd.

#### Dynodiad

Ceir [gwahanol fathau o ddynodiadau ystadegau](https://uksa.statisticsauthority.gov.uk/about-the-authority/uk-statistical-system/types-of-official-statistics/). Mae diffiniadau’r rhain fel a ganlyn:

| Dynodiad                                                              | Yr hyn y mae’n ei olygu                                                                                                                                                                            |
| :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ystadegau swyddogol                                                   | Ystadegau sy’n cael eu creu gan gyrff y Goron a sefydliadau eraill a restrir mewn Gorchymyn Ystadegau Swyddogol, ar ran llywodraeth y DU neu weinyddiaethau datganoledig                           |
| Ystadegau swyddogol achrededig (Ystadegau Gwladol yn flaenorol)       | Ystadegau swyddogol y mae’r Swyddfa Rheoleiddio Ystadegau (OSR) wedi eu hadolygu’n annibynnol a chadarnhau eu bod yn cydymffurfio â safonau dibynadwyedd, ansawdd a gwerth                         |
| Ystadegau swyddogol mewn datblygiad (ystadegau arbrofol yn flaenorol) | Ystadegau swyddogol sy’n cael eu datblygu; efallai eu bod yn ystadegau newydd neu sy’n bodoli eisoes, a byddant yn cael eu profi gyda defnyddwyr, yn unol â safonau dibynadwyedd, ansawdd a gwerth |
| Gwybodaeth reolaethol                                                 | Data gweithredol sy'n cynnig tryloywder am weithgarwch sefydliad                                                                                                                                   |
| Dim dynodiad                                                          | Unrhyw ystadegau eraill                                                                                                                                                                            |

#### Pynciau perthnasol

Ceir 13 pwnc lefel uchel, y mae gan y rhan fwyaf ohonynt bynciau eilaidd. Mae **tag pwnc unigol** yn cynnwys ‘lefel uchel \+ pwnc eilaidd’. Yr unig eithriadau yw tagiau pwnc ‘Twristiaeth’ a’r ‘Iaith Gymraeg’, sy’n rhai lefel uchel yn unig.

Er enghraifft, gallai set ddata fod wedi cael ei thagio â thag pwnc unigol ‘Yr amgylchedd, ynni ac amaethyddiaeth: Ffermio’. Neu fe allai fod wedi cael ei thagio ag ail dag pwnc fel ‘Busnes, yr economi a’r farchnad lafur: Busnes’. Dylech ddewis cymaint o dagiau pwnc ag sy’n berthnasol i’r set ddata.

Bydd y detholiad hwn yn caniatáu i ddefnyddwyr leoli a nodi setiau data sydd o ddiddordeb iddynt yn haws. Mae’n bwysig ystyried y gwahanol ffyrdd y gall defnyddwyr gategoreiddio’r hyn y mae set ddata yn ei chynnwys.

**Busnes, yr economi a’r farchnad lafur**

- Busnes
- Mynegeion economaidd
- Cyflogaeth
- Incwm gwario gros aelwydydd
- Gwerth ychwanegol gros
- Ymchwil a datblygu

**Trosedd, tân ac achub**

- Trosedd a chyfiawnder
- Digwyddiadau tân ac achub
- Gwasanaethau tân
- Yr Heddlu

**Addysg a hyfforddiant**

- Prentisiaethau
- Addysg bellach
- Addysg uwch
- Dysgu gydol oes
- Disgyblion
- Ysgolion
- Cymorth i fyfyrwyr
- Athrawon a staff cymorth
- Gwaith ieuenctid

**Yr amgylchedd, ynni ac amaethyddiaeth**

- Ansawdd aer
- Ynni
- Ffermio
- Llifogydd
- Tipio anghyfreithlon
- Nwyon tŷ gwydr
- Tir
- Rheoli gwastraff

**Cyllid a threth**

- Cyfalaf
- Treth gyngor
- Treth trafodiadau tir
- Treth gwarediadau tirlenwi
- Ardrethi annomestig (ardrethi busnes)
- Refeniw
- Setliad

**Iechyd a gofal cymdeithasol**

- Gwasanaethau ambiwlans
- Plant
- Coronafeirws (COVID-19)
- Gwasanaethau deintyddol
- Cyllid iechyd
- Gweithgarwch ysbytai a lleoliadau gofal eraill
- Meddygaeth deulu
- Mamolaeth, genedigaethau a beichiogi
- Iechyd meddwl
- Perfformiad ac amseroedd aros
- Gofal sylfaenol a gwasanaethau cymunedol
- Staff
- Gofal cymdeithasol a gofal dydd
- Gwasanaethau cymdeithasol
- Camddefnyddio sylweddau

**Tai**

- Tai fforddiadwy
- Dymchweliadau
- Grantiau cyfleusterau i’r anabl
- Peryglon, trwyddedau ac ansawdd tai
- Help i brynu
- Digartrefedd
- Niferoedd aelwydydd
- Gwella tai
- Stoc tai a’r angen
- Adeiladu tai newydd
- Meddiannau a throi allan
- Rhenti yn y sector preifat
- Tai cymdeithasol
- Cyfrif carafannau teithwyr

**Pobl, hunaniaeth a chydraddoldeb**

- Oedran
- Anabledd  
  Ethnigrwydd
- Hunaniaeth rhywedd
- Iaith
- Statws priodasol
- Mudo
- Hunaniaeth genedlaethol
- Poblogaeth
- Beichiogrwydd a mamolaeth
- Crefydd
- Rhyw
- Cyfeiriadedd rhywiol
- Statws cymdeithasol-economaidd

**Tlodi**

- Cymunedau yn Gyntaf
- Amdddifadedd
- Cronfa cymorth dewisol
- Tlodi incwm

**Twristiaeth**

**Trafnidiaeth**

- Awyr
- Rheilffyrdd
- Ffyrdd
- Môr

**Llywodraeth leol a Chymru**

- Cofrestr etholiadol
- Gweithlu’r llywodraeth
- Perfformiad awdurdod lleol
- Etholaethau’r Senedd

**Yr Iaith Gymraeg**
