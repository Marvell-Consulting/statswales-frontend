# Paratoi data: Diweddaru setiau data

## Diweddaru gwerthoedd data

Os bydd angen i chi ychwanegu neu ddisodli gwerthoedd data mewn set ddata, dylech baratoi tablau data wedi’u diweddaru.

Dylai’r rhain fod yn yr **un fformat â’r tabl data a lanlwythwyd yn wreiddiol** ar gyfer y set ddata hon. Dylid defnyddio’r **un colofnau a phenawdau colofnau.**

<!-- Gallwch wirio fformat ffeiliau data a lanlwythwyd yn flaenorol trwy eu lawrlwytho o'r tab 'Hanes' ar dudalen trosolwg set ddata. -->

## Ychwanegu data newydd yn unig

Mae hyn yn golygu ychwanegu gwerthoedd ar gyfer data nad yw yn y set ddata ar hyn o bryd. Er enghraifft, gwerthoedd data ar gyfer y flwyddyn ddiweddaraf. Dylai tabl data y diweddariad gynnwys **y gwerthoedd data newydd yr ydych chi’n eu hychwanegu yn unig**.

Rhesi enghreifftiol tabl data diweddariad ar gyfer bandiau treth gyngor, gan ychwanegu data newydd ar gyfer 2024/25:

| CodArdal  | CodBlwyddyn | CodBand | CodNodyn | Mesur neu fath data | Data    |
| :-------- | :---------- | :------ | :------- | :------------------ | :------ |
| W06000001 | 2024/25     | A-      |          | 1                   | 1216.86 |
| W06000001 | 2024/25     | A       |          | 1                   | 1014.05 |
| W06000001 | 2024/25     | B       |          | 1                   | 1419.67 |
| W06000001 | 2024/25     | C       |          | 1                   | 1622.48 |
| W06000001 | 2024/25     | D       |          | 1                   | 1825.30 |

_Sylwer mai enghraifft at ddibenion dangos yw hon, ac nid yw’n ddiweddariad go iawn._

## Diwygio data

Mae hyn yn golygu disodli gwerthoedd data yn y set ddata bresennol gyda gwerthoedd diwygiedig. Efallai bod hyn oherwydd yr arferai gwerthoedd fod yn rhai amodol, neu mae angen eu cywiro. Dylai’r tabl wedi’i ddiweddaru gynnwys **y gwerthoedd data yr ydych chi’n eu diwygio yn unig**.

Rhesi enghreifftiol tabl data diweddariad ar gyfer bandiau treth gyngor, gan ddiwygio data ar gyfer 2022/23:

| CodArdal  | CodBlwyddyn | CodBand | CodNodyn | Mesur neu fath data | Data    |
| :-------- | :---------- | :------ | :------- | :------------------ | :------ |
| W06000001 | 2022/23     | G       |          | 1                   | 3042.10 |
| W06000001 | 2022/23     | H       |          | 1                   | 3650.60 |
| W06000001 | 2022/23     | I       |          | 1                   | 4259.03 |
| W06000002 | 2022/23     | A-      |          | 1                   | 1104.00 |
| W06000002 | 2022/23     | A       |          | 1                   | 1324.80 |

_Sylwer mai enghraifft at ddibenion dangos yw hon, ac nid yw’n ddiweddariad go iawn._

### Trin codau nodiadau mewn ffordd awtomatig

Pan fyddwch yn diwygio gwerthoedd data yn SW3, bydd y system yn gwirio eich tabl data wedi’i ddiweddaru yn erbyn y data presennol. Ar gyfer _yr holl werthoedd data sydd wedi newid_, bydd y system yn ychwanegu cod nodiadau ‘r’ i’r golofn cod nodiadau yn awtomatig. Diben hyn yw helpu’r defnyddiwr i wybod os oes unrhyw werthoedd data wedi newid.

Yr unig eithriad i hyn yw pan fydd gwerthoedd data a nodwyd fel rhai amodol (p) neu ragolygol (f) yn flaenorol, wedi cael eu newid. Yn yr achosion hyn:

- bydd y system yn gwaredu’r codau nodiadau 'p' ac 'f' blaenorol
- ni fydd y system yn ychwanegu unrhyw godau nodiadau 'r' i’r gwerthoedd hyn

Mae hyn yn unol â’r dull a argymhellir gan StatsCymru ar gyfer ‘terfynu’ gwerthoedd data amodol neu ragolygol.

Fodd bynnag, efallai y bydd achosion lle y bydd angen newid gwerth amodol neu ragolygol gyda diweddariad, ond cadw ei label amodol neu ragolygol. Yn yr achosion hyn, dylech sicrhau bod y gwerthoedd data perthnasol yn cynnwys ‘p’ neu ‘f’ yn y golofn codau nodiadau yn eich tabl am-edrych wedi’i ddiweddaru. Yna, bydd y system yn cadw’r codau ‘p’ neu ‘f’ yn y tabl data sy’n bodoli eisoes.

## Ychwanegu a diwygio data

Os bydd angen i chi ychwanegu gwerthoedd data newydd a diwygio gwerthoedd data sy’n bodoli eisoes, rhaid i chi gyfuno’r rhain mewn **tabl diweddaru unigol**.

## Newid data heb drin codau nodiadau mewn ffordd awtomatig

Efallai y bydd amgylchiadau prin lle y bydd angen i chi newid gwerthoedd data heb drin codau nodiadau ‘r’, ‘p’ ac ‘f’ mewn ffordd awtomatig. Yn yr achosion hyn, dylech sicrhau bod y golofn codau nodiadau yn eich tabl data wedi’i ddiweddaru yn gywir ar gyfer yr hyn yr ydych chi’n dymuno ei ddangos i’r defnyddiwr. Hynny yw, os ydych chi’n dymuno:

- ychwanegu cod nodiadau, sicrhau ei fod yn y golofn cod nodiadau
- gwaredu cod nodiadau sy’n bodoli eisoes, sicrhau nad yw yn y golofn cod nodiadau

Pan fyddwch yn [lanlwytho eich tabl am-edrych wedi’i ddiweddaru](Using-SW3---Updating-a-dataset), bydd angen i chi ddewis ‘Newid data heb drin codau nodiadau mewn ffordd awtomatig'.

## Gwaredu data

Dim ond os oes rheswm dilys ac ystadegol dros wneud hynny y dylech chi waredu gwerthoedd data. Ni allwch waredu rhesi cyfan o’ch set ddata.

I waredu gwerthoedd data, dylech ddilyn yr un broses â’r broses a ddilynir er mwyn diwygio data, ond gyda:

- chelloedd gwag ar gyfer y gwerthoedd data a waredir
- y [testun llaw-fer nodyn gwerth data priodol](Data-preparation-‐-New-datasets#guidance-nodiadau) i esbonio pam nad yw’r gwerth data yn bresennol mwyach

Gan ddibynnu ar y rheswm dros waredu, efallai y bydd angen ychwanegu esboniad i’r [adran metadata ‘ansawdd ystadegol](Data-preparation-‐-New-datasets#guidance-ansawdd-ystadegol)’.

Rhesi enghreifftiol tabl data diweddariad ar gyfer bandiau treth gyngor, gan waredu data ar gyfer band A treth gyngor cyn 2001/02:

| CodArdal  | CodBlwyddyn | CodBand | CodauNodiadau | Mesur neu fath data | Data |
| :-------- | :---------- | :------ | :------------ | :------------------ | :--- |
| W06000001 | 1996/97     | A-      | z             | 1                   |      |
| W06000001 | 1997/98     | A-      | z             | 1                   |      |
| W06000001 | 1998/99     | A-      | z             | 1                   |      |
| W06000001 | 1999/00     | A-      | z             | 1                   |      |
| W06000001 | 2000/01     | A-      | z             | 1                   |      |

_Sylwer mai enghraifft at ddibenion dangos yw hon, ac nid yw’n ddiweddariad go iawn._

## Disodli’r holl ddata presennol

Efallai y bydd amgylchiadau prin pan fydd angen i chi ddisodli’r holl ddata presennol. Mae’n bwysig iawn eich bod yn sicrhau:

- bod rheswm dilys dros ddisodli’r holl ddata
- bod y data yn y tabl data diweddariad yn gywir
- na chollir data o’r set ddata sydd wedi cael ei chyhoeddi ar hyn o bryd (oni bai bod angen ei [waredu am reswm dilys](#guidance-gwaredu-data))

## Diweddaru metadata

Gellir diweddaru unrhyw [adran o’r metadata](Data-preparation-‐-New-datasets#guidance-metadata) yn ôl yr angen. Gellir gwneud hyn os yw’r data ei hun yn cael ei ddiweddaru neu beidio. Yn ogystal, efallai y bydd angen esbonio pam bod y metadata wedi cael ei newid, yn yr adran berthnasol.

## Diweddariadau nad ydynt yn bosibl ar hyn o bryd

Yn y system bresennol, ni allwch:

- ychwanegu dimensiwn newydd i set ddata
- dileu dimensiwn o set ddata
