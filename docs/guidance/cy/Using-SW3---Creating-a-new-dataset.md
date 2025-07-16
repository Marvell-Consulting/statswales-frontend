# Defnyddio SC3: Creu set ddata newydd

## Data

O’ch sgrin hafan, cliciwch ‘Creu set ddata newydd’. Gan ddefnyddio eich [data a baratowyd](Data-preparation-‐-New-datasets#guidance-tablau-data), byddwch yn mynd trwy’r camau canlynol.

1. Ychwanegu teitl.
2. Lanlwytho eich tabl data.
3. Nodi’r hyn y mae pob colofn yn y tabl data yn ei gynnwys, naill ai:
   - gwerthoedd data
   - dimensiwn
   - mesur neu fathau data
   - codau nodiadau

Yna, byddwch yn cael eich tywys i’ch rhestr dasgau ar gyfer eich set ddata. Bydd hon yn rhestru’r holl ddimensiynau a nodoch, ac eithrio codau nodiadau gan bod y rhain wedi cael eu safoni.

Bydd clicio ar bob dimensiwn yn caniatáu i chi ddewis pa fath o ddata sydd yn y dimensiwn. Bydd hyn naill ai yn:

<!-- - dyddiadau – yna byddwch yn ateb cwestiynau am ffurf y dyddiad a ddefnyddiwyd, neu byddwch yn lanlwytho eich tabl am-edrych eich hun os bydd angen -->
- daearyddiaeth – yna byddwch yn dewis y data cyfeirio safonol priodol
<!-- - dyddiadau – yna byddwch yn ateb cwestiynau am ffurf y dyddiad a ddefnyddiwyd, neu byddwch yn lanlwytho eich tabl am-edrych eich hun os bydd angen -->
- daearyddiaeth – yna byddwch yn dewis y data cyfeirio safonol priodol
- testun, [lle nad oes angen cael tabl am-edrych](Data-preparation-‐-New-datasets#guidance-dimensiynau-sy'n-cynnwys-testun-neu-rifau-lle-nad-oes-gofyn-cael-tabl-am-edrych)
- rhifau, [lle nad oes angen cael tabl am-edrych](Data-preparation-‐-New-datasets#guidance-dimensiynau-sy'n-cynnwys-testun-neu-rifau-lle-nad-oes-gofyn-cael-tabl-am-edrych) - yna bydd angen i chi nodi'r math o rifau a ddefnyddir
  - Ar gyfer y dewis hwn, rhaid i'r dimensiwn gynnwys rhifau yn unig, heb unrhyw symbolau neu lythrennau.
- rhywbeth arall – yna byddwch yn lanlwytho eich tabl am-edrych eich hun

Yn yr achosion prin lle nad ydych chi wedi gallu defnyddio dyddiadau neu ddaearyddiaeth safonol, dylech ddewis 'Rhywbeth arall' a lanlwytho eich tablau am-edrych a baratowyd.

Ar gyfer y rhan fwyaf o ddewisiadau, gofynnir i chi nodi enw i alw’r dimensiwn ar wefan StatsCymru. Dylai’r enw fod:

- yn gryno, gan esbonio'n glir yr hyn y mae'r dimensiwn yn ei gynnwys
- yn wahanol i enwau dimensiwn eraill yn y set ddata

Os byddwch yn dewis data cyfeirio safonol, llenwir yr enw dimensiwn yn awtomatig. Gallwch newid hwn, ond dim ond os bydd gwir angen gwneud hyn er mwyn deall y set ddata y dylech wneud hyn. Er enghraifft, set ddata ynghylch mudo lle y ceir 2 ddimensiwn sy’n cynnwys awdurdodau lleol – mae un yn awdurdod lleol y symudodd rhywun ohono a’r llall yw’r un y gwnaethant symud iddo. Yn y sefyllfa honno, efallai y byddech yn ailenwi’r dimensiynau yn “Awdurdodau lleol y symudwyd ohonynt” ac “Awdurdodau lleol y symudwyd iddynt” er mwyn gwahaniaethu rhyngddynt.

Ar gyfer dimensiwn sy'n cynnwys mathau o ddata neu fesur, pan fyddwch yn clicio arno o'ch rhestr dasgau ar gyfer y set ddata, bydd angen i chi lanlwytho'r [tabl am-edrych priodol](Data-preparation-‐-New-datasets#guidance-mathau-data-neu-fesur) wedi hyn.

### Cwestiynau am ffurf y dyddiadau

Ar gyfer [dimensiynau sy’n cynnwys dyddiadau](Data-preparation-‐-New-datasets#guidance-fformatio-dyddiadau), gofynnir i chi a yw’r dimensiwn yn cynnwys:

- cyfnodau – er enghraifft, misoedd neu flynyddoedd y mae gwerthoedd data yn berthnasol iddynt
- pwyntiau penodol – er enghraifft, dyddiadau penodol pan gasglwyd gwerthoedd data

Ar gyfer cyfnodau, gofynnir i chi yn gyntaf a fydd angen i chi ddefnyddio ffurf dyddiad safonol neu lanlwytho eich tabl am-edrych dyddiad eich hun. Dim ond eich tabl am-edrych dyddiad eich hun y dylech ei lanlwytho os na allwch ddefnyddio unrhyw rai o’r ffurfiau dyddiad derbyniol.

Ar gyfer ffurf dyddiad safonol, gofynnir i chi:

- y math o flwyddyn y mae’r dimensiwn yn ei chynrychioli
- ffurf y dyddiad a ddefnyddir ar gyfer blynyddoedd
- a yw’r cyfnod byrraf yn y dimensiwn yn fisoedd, yn chwarteri neu’n flynyddoedd
- ffurf y dyddiad a ddefnyddir ar gyfer misoedd neu chwarteri (pan fo hynny’n berthnasol)

Ar gyfer pwyntiau penodol, gofynnir i chi am ffurf y dyddiad a ddefnyddir yn unig.

### Camgymeriadau

Bydd y system yn gwirio a yw’r data a ddewiswyd neu’r data cyfeirio a lanlwythwyd, neu’r ffurf a ddynodwyd ar gyfer y dyddiadau, yn cyfateb â chynnwys eich tabl data. Os bydd unrhyw broblemau, bydd y system yn ceisio eu hesbonio, gan nodi’r hyn y bydd angen i chi ei wneud i’w trwsio.

Er enghraifft, os byddwch wedi defnyddio cod cyfeirio yn eich tabl data nad yw yn y tabl am-edrych a lanlwythwyd gennych.

### Gwneud newidiadau

O’r rhestr dasgau ar gyfer eich set ddata, os byddwch yn clicio ar ‘Tabl data’, gallwch:

- lanlwytho tabl data gwahanol
- newid yr hyn y mae pob colofn yn y tabl data yn ei gynnwys

Sylwer, bydd y ddwy weithred hon yn gwaredu’r holl ddata cyfeirio o bob dimensiwn.

Os byddwch yn clicio ar ddimensiwn, gallwch:

- ddisodli’r tabl am-edrych a lanlwythwyd (pan fo hynny’n berthnasol)
- newid pa fath o ddata sydd yn y dimensiwn
- newid enw y dimensiwn

## Metadata

Dylech ychwanegu’r holl [fetadata a baratowyd](Data-preparation-‐-New-datasets#guidance-metadata) i’r adrannau priodol. Gellir gwneud hyn mewn unrhyw drefn. Gallwch ddychwelyd at unrhyw adran trwy glicio arni o’r rhestr dasgau ar gyfer eich set ddata.

## Cyfieithiadau

Ar ôl i chi lenwi’r holl feysydd cofnodi testun, byddwch yn gallu allgludo’r holl destun i un ffeil CSV. Defnyddir y CSV hon i fewnbynnu’r holl gyfieithiadau gofynnol yn Gymraeg neu yn Saesneg, gan ddibynnu ar ba iaith a ddefnyddioch i lenwi’r holl feysydd.

1. O’ch rhestr dasgau ar gyfer eich set ddata, cliciwch ‘allgludo meysydd testun i’w cyfieithu’.
2. Dangosir yr holl destun perthnasol i chi a byddwch yn gallu gwneud unrhyw newidiadau terfynol, yn ôl yr angen.
3. I grynhoi, mae’r holl feysydd testun posibl fel a ganlyn:
   - enwau dimensiwn
   - teitl
   - crynodeb o set ddata a newidynnau
   - gasglu new cyfrifo data
   - ansawdd ystadegol
   - wedi’u talgrynnu
   - testun(au) cyswllt adroddiad cysylltiedig
4. Cliciwch ‘Allgludo CSV’ er mwyn lawrlwytho tabl sy’n cynnwys colofnau ar gyfer:
   - enw maes testun
   - testun (Saesneg)
   - testun (Cymraeg)
5. Llenwir y golofn ar gyfer pa bynnag iaith yr ydych chi wedi bod yn ei defnyddio.
6. Dylech anfon y CSV hon at eich cyfieithydd er mwyn iddynt nodi’r cyfieithiadau gofynnol, neu gofnodi’r cyfieithiadau eich hun os oes gennych chi nhw.

Wrth agor y CSV cyfieithiadau a allgludwyd mewn meddalwedd fel Excel, efallai y bydd meysydd testun sy’n cynnwys paragraffau lluosog yn rhannu ar draws celloedd lluosog. Os bydd hyn yn digwydd, dylech sicrhau bod yr holl destun ar gyfer adran benodol, mewn un iaith, mewn un cell.

Mae'r gwerthoedd yn y golofn 'allwedd' yn unigryw i bob set ddata. Felly, dylech sicrhau:

- eich bod yn defnyddio ffeil y cyfieithiad a allgludwyd ar gyfer y set ddata yr ydych yn ei chreu
- nad ydych chi'n newid unrhyw rai o'r gwerthoedd yn y golofn allwedd

Ar ôl i chi gwblhau’r CSV:

1. dewiswch ‘Mewngludo cyfieithiadau’ o’r rhestr dasgau ar gyfer eich set ddata
2. lanlwythwch y CSV a gwiriwch bod y cyfieithiadau wedi lanlwytho’n gywir
3. cliciwch ‘Parhau’ i lenwi’r holl feysydd mewn ffordd briodol

Gallwch weld rhagolwg o’ch set ddata lawn nawr yn Gymraeg ac yn Saesneg.

## Cyhoeddi

### Pryd y dylid cyhoeddi’r set ddata

Nodwch y dyddiad a’r amser pan ddylid cyhoeddi’r set ddata. Ystyriwch pa mor hir y bydd hi’n cymryd i gymeradwyo’r set ddata ar ôl i chi ei chyflwyno. Dylech osod y dyddiad cyhoeddi yn ddigon pell yn y dyfodol er mwyn caniatáu hyn.

Yr amser cyhoeddi yw 9:30am, yr amser lleol yn y DU, fel rhagosodiad. Dim ond os yw amser gwahanol yn hollol angenrheidiol y dylech chi newid hwn.

### Cyflwyno

Cyflwyno'r set ddata i'w chymeradwyo. Bydd cymeradwywr yn eich grŵp yn gwirio'r set ddata ac yn ei chymeradwyo neu'n ei gwrthod at ddibenion ei chyhoeddi ar y dyddiad cyhoeddi arfaethedig.

Os bydd y cymeradwywr yn gwrthod y set ddata at ddibenion cyhoeddi, byddant yn cynnig manylion am y rheswm dros ei gwrthod a'r hyn y mae angen ei drwsio. Bydd modd gweld y manylion hyn yn yr adran 'Hanes' ar dudalen trosolwg y set ddata. Ar ôl trwsio'r materion, gellir ailgyflwyno'r set ddata er mwyn iddi gael ei chymeradwyo.
