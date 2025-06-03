# Paratoi data: Diweddaru setiau data

## Diweddaru gwerthoedd data

Os bydd angen i chi ychwanegu neu ddisodli data mewn set ddata, dylech baratoi tablau data.

Dylai’r rhain fod yn yr **un fformat â’r tabl data a lanlwythwyd yn wreiddiol** ar gyfer y set ddata hon. Dylid defnyddio’r **un colofnau a phenawdau colofnau.**

<!-- Gallwch wirio fformat ffeiliau data a lanlwythwyd yn flaenorol trwy eu lawrlwytho o'r tab 'Hanes' ar dudalen trosolwg set ddata. -->

<!-- Gallwch archwilio’r fformatio a cholofnau’r tabl data a lanlwythwyd yn wreiddiol yn SW3 trwy:

- ddewis y set ddata y mae angen i chi ei diweddaru o’ch sgrin hafan
- dewis ‘Gweld tabl data a lanlwythwyd yn wreiddiol’ -->

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

Mae hyn yn golygu disodli data yn y set ddata bresennol gyda gwerthoedd diwygiedig. Gallai hyn fod oherwydd yr arferai’r gwerthoedd fod yn rhai dros dro, neu mae angen eu cywiro. Dylai tabl data y diweddariad gynnwys **y gwerthoedd data yr ydych chi’n eu diwygio yn unig**.

Rhesi enghreifftiol tabl data diweddariad ar gyfer bandiau treth gyngor, gan ddiwygio data ar gyfer 2022/23:

| CodArdal  | CodBlwyddyn | CodBand | CodNodyn | Mesur neu fath data | Data    |
| :-------- | :---------- | :------ | :------- | :------------------ | :------ |
| W06000001 | 2022/23     | G       | r        | 1                   | 3042.10 |
| W06000001 | 2022/23     | H       | r        | 1                   | 3650.60 |
| W06000001 | 2022/23     | I       | r        | 1                   | 4259.03 |
| W06000002 | 2022/23     | A-      | r        | 1                   | 1104.00 |
| W06000002 | 2022/23     | A       | r        | 1                   | 1324.80 |

_Sylwer mai enghraifft at ddibenion dangos yw hon, ac nid yw’n ddiweddariad go iawn._

## Ychwanegu a diwygio data

Os bydd angen i chi ychwanegu data newydd a diwygio data sy’n bodoli eisoes, rhaid i chi gyfuno’r rhain mewn **tabl diweddariad unigol.**

## Disodli’r holl ddata presennol

Efallai y bydd amgylchiadau prin pan fydd angen i chi ddisodli’r holl ddata presennol. Mae’n bwysig iawn eich bod yn sicrhau:

- bod rheswm dilys dros ddisodli’r holl ddata
- bod y data yn y tabl data diweddariad yn gywir
- na chollir data o’r set ddata sydd wedi cael ei chyhoeddi ar hyn o bryd (oni bai bod angen ei [waredu am reswm dilys](#guidance-gwaredu-data))
- bod yr holl werthoedd data diwygiedig yn cynnwys [‘r’ yn y golofn cod nodyn](Data-preparation-‐-New-datasets#guidance-nodiadau)

## Gwaredu data

Dim ond os oes rheswm dilys ac ystadegol dros wneud hynny y dylech chi waredu gwerthoedd data. Ni allwch waredu rhesi cyfan o’ch set ddata.

I waredu gwerthoedd data, dylech ddilyn yr un broses â’r broses a ddilynir er mwyn diwygio data, ond gyda:

- chelloedd gwag ar gyfer y gwerthoedd data a waredir
- y [testun llaw-fer nodyn gwerth data priodol](Data-preparation-‐-New-datasets#guidance-nodiadau) i esbonio pam nad yw’r gwerth data yn bresennol mwyach
- llaw-fer ‘r’ sy’n dynodi mai diwygiad yw hwn

Gan ddibynnu ar y rheswm dros waredu, efallai y bydd angen ychwanegu esboniad i’r [adran metadata ‘ansawdd ystadegol](Data-preparation-‐-New-datasets#guidance-ansawdd-ystadegol)’.

Rhesi enghreifftiol tabl data diweddariad ar gyfer bandiau treth gyngor, gan waredu data ar gyfer band A treth gyngor cyn 2001/02:

| CodArdal  | CodBlwyddyn | CodBand | CodauNodiadau | Mesur neu fath data | Data |
| :-------- | :---------- | :------ | :------------ | :------------------ | :--- |
| W06000001 | 1996/97     | A-      | z,r           | 1                   |      |
| W06000001 | 1997/98     | A-      | z,r           | 1                   |      |
| W06000001 | 1998/99     | A-      | z,r           | 1                   |      |
| W06000001 | 1999/00     | A-      | z,r           | 1                   |      |
| W06000001 | 2000/01     | A-      | z,r           | 1                   |      |

_Sylwer mai enghraifft at ddibenion dangos yw hon, ac nid yw’n ddiweddariad go iawn._

## Diweddaru metadata

Gellir diweddaru unrhyw [adran o’r metadata](Data-preparation-‐-New-datasets#guidance-metadata) yn ôl yr angen. Gellir gwneud hyn os yw’r data ei hun yn cael ei ddiweddaru neu beidio. Yn ogystal, efallai y bydd angen esbonio pam bod y metadata wedi cael ei newid, yn yr adran berthnasol.

## Diweddariadau nad ydynt yn bosibl ar hyn o bryd

Yn y system bresennol, ni allwch:

- ychwanegu dimensiwn newydd i set ddata
- dileu dimensiwn o set ddata
