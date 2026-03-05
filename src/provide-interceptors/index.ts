import { apply, applyTemplates, chain, externalSchematic, MergeStrategy, mergeWith, move, Rule, SchematicContext, Source, strings, Tree, url } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { addRootProvider } from '@schematics/angular/utility';
import { normalize } from 'path';

export function provideInterceptors(_options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Initialising Interceptors Schematic');
    const path = 'src/app/interceptors';
    if (tree.exists(`${path}/http-error-interceptor.ts`) && tree.exists(`${path}/headers-interceptor.ts`)) {
      context.logger.info('✅ Interceptors already exist');
      return tree;
    }
    const interceptors: Rule[] = [];

    const templateErrorSrc: Source = apply(url('./files/errors'), [
      applyTemplates({ classify: strings.classify, dasherize: strings.dasherize }),
      move(normalize(path))
    ]);
    interceptors.push(externalSchematic('@schematics/angular', 'interceptor', { name: 'http-error', path: path, }));
    interceptors.push(mergeWith(templateErrorSrc, MergeStrategy.Overwrite));

    const templateHeadersSrc: Source = apply(url('./files/headers'), [
      applyTemplates({ classify: strings.classify, dasherize: strings.dasherize }),
      move(normalize(path))
    ]);
    interceptors.push(externalSchematic('@schematics/angular', 'interceptor', { name: 'headers', path: path, }));
    interceptors.push(mergeWith(templateHeadersSrc, MergeStrategy.Overwrite));

    return chain([
      ...interceptors,
      addRootProvider(_options.project, ({ code, external }) => {
        return code`${external('httpErrorInterceptor', './interceptors/http-error-interceptor'),
          external('headersInterceptor', './interceptors/headers-interceptor'),
          external('provideHttpClient', '@angular/common/http')}
          (${external('withInterceptors', '@angular/common/http')}([httpErrorInterceptor, headersInterceptor]))`;

      })
    ])
  }

}