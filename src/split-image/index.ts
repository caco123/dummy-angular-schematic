import { Rule, apply, applyTemplates, url, move, mergeWith, chain, externalSchematic, MergeStrategy, Tree, SchematicContext } from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';
import { Schema } from './schema';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function splitImage(_options: Schema): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    _context.logger.info('🚀 Split Image Schematic');

    const { imageSrc1, addRoute, imageSrc2, ..._angularOptions } = _options;

    const templateSrc = apply(url('./files'), [
      applyTemplates({
        classify: strings.classify,
        dasherize: strings.dasherize,
        name: _options.name,
        imageSrc1,
        imageSrc2
      }),
      move(normalize(`/${_options.path}/${strings.dasherize(_options.name)}`)),
    ]);

    if (addRoute) {
      return chain([
        externalSchematic('@schematics/angular', 'component', _angularOptions),
        mergeWith(templateSrc, MergeStrategy.Overwrite),
        addRouteToAppRoutes(_options)
      ]);
    }
    return chain([
      externalSchematic('@schematics/angular', 'component', _angularOptions),
      mergeWith(templateSrc, MergeStrategy.Overwrite),
    ]);
  };
}

function addRouteToAppRoutes(_options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const routesPath = `${_options.path}/../app.routes.ts`;

    if (!tree.exists(routesPath)) {
      _context.logger.warn(`❌ app.routes.ts not found at ${routesPath}`);
      return tree;
    }

    const content = tree.read(routesPath)!.toString('utf-8');
    const dasherizedName = strings.dasherize(_options.name);
    const classifiedName = strings.classify(_options.name);

    // Verificar si la ruta ya existe
    if (content.includes(`path: '${dasherizedName}'`)) {
      _context.logger.warn(`Route '${dasherizedName}' already exists.`);
      return tree;
    }

    const newRoute = `
    {
        path: '${dasherizedName}',
        loadComponent: () => import('./${_options.path.replace('src/app/', '')}/${dasherizedName}/${dasherizedName}').then(m => m.${classifiedName})
    },`;

    // Insertar antes del cierre del array "];""
    const updatedContent = content.replace('];', `${newRoute}\n];`);
    tree.overwrite(routesPath, updatedContent);

    _context.logger.info(`Route '${dasherizedName}' added to app.routes.ts`);
    return tree;
  };
}