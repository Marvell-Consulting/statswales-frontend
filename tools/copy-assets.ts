import * as shell from 'shelljs';
shell.cp('-R', 'src/shared/public/assets', 'dist/');
shell.cp('-R', 'src/shared/public/css', 'dist/');
shell.cp('-R', 'src/shared/i18n', 'dist/shared/i18n/');
