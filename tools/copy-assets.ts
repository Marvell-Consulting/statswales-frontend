import * as shell from 'shelljs';
shell.cp('-R', 'src/publisher/views', 'dist/publisher/');
shell.cp('-R', 'src/consumer/views', 'dist/consumer/');
shell.cp('-R', 'src/shared/views', 'dist/shared/');
shell.cp('-R', 'src/shared/public/assets', 'dist/public/');
shell.cp('-R', 'src/shared/public/css', 'dist/public/');
shell.cp('-R', 'src/shared/i18n', 'dist/shared/');
