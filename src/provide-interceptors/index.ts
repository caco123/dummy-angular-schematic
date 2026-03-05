import * as ts from 'typescript';
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { InterceptorType, Schema } from './schema';
import { addRootProvider } from '@schematics/angular/utility';

export function provideInterceptors(_options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const appConfigPath = 'src/app/app.config.ts';
    const interceptorNames = [];
    if (_options.interceptors.includes(InterceptorType.ErrorInterceptor)) interceptorNames.push('httpErrorInterceptor');
    if (_options.interceptors.includes(InterceptorType.HeadersInterceptor)) interceptorNames.push('headersInterceptor');

    const fileContent = tree.read(appConfigPath)?.toString() || '';
    const hasHttpClient = fileContent.includes('provideHttpClient');

    const rules: Rule[] = [];

    if (hasHttpClient) {
      // ESCENARIO A: Ya existe provideHttpClient, editamos el array
      context.logger.info('Actualizando provideHttpClient existente...');
      rules.push(addInterceptorsToExistingProvider(tree, appConfigPath, interceptorNames));

      // Nota: Aquí también deberías añadir los 'import' de los interceptores al inicio del archivo
      // usando InsertChange o funciones de utilidad de Angular
    } else {
      // ESCENARIO B: No existe, usamos tu addRootProvider original
      rules.push(addRootProvider(_options.project, ({ code, external }) => {
        // ... (tu lógica de code`...` que ya tenías)
        const interceptorNames: string[] = [];

        // Importamos los interceptores dinámicamente
        if (_options.interceptors.includes(InterceptorType.ErrorInterceptor)) {
          external('httpErrorInterceptor', './interceptors/http-error.interceptor');
          interceptorNames.push('httpErrorInterceptor');
        }
        if (_options.interceptors.includes(InterceptorType.HeadersInterceptor)) {
          external('headersInterceptor', './interceptors/headers.interceptor');
          interceptorNames.push('headersInterceptor');
        }

        // Generamos la llamada: provideHttpClient(withInterceptors([int1, int2]))
        return code`
          ${external('provideHttpClient', '@angular/common/http')}(
            ${external('withInterceptors', '@angular/common/http')}([${interceptorNames.join(', ')}])
          )
        `;
      }));
    }

    return chain(rules);
  };
}

function addInterceptorsToExistingProvider(_host: Tree, filePath: string, interceptors: string[]): Rule {
  return (tree: Tree) => {
    const text = tree.read(filePath);
    if (!text) return tree;

    const sourceText = text.toString('utf-8');
    const source = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);

    // 1. Buscar el nodo de 'withInterceptors([...])'
    const recorder = tree.beginUpdate(filePath);

    // Función recursiva para encontrar el array dentro de withInterceptors
    function findInterceptorsArray(node: ts.Node): ts.ArrayLiteralExpression | null {
      if (ts.isCallExpression(node) &&
        node.expression.getText() === 'withInterceptors' &&
        node.arguments.length > 0 &&
        ts.isArrayLiteralExpression(node.arguments[0])) {
        return node.arguments[0] as ts.ArrayLiteralExpression;
      }
      return ts.forEachChild(node, findInterceptorsArray) || null;
    }

    const arrayNode = findInterceptorsArray(source);

    if (arrayNode) {
      const existingElements = arrayNode.elements.map(e => e.getText());
      const toAdd = interceptors.filter(i => !existingElements.includes(i));

      if (toAdd.length > 0) {
        const isNotEmpty = existingElements.length > 0;
        const prefix = isNotEmpty ? ', ' : '';
        const newText = prefix + toAdd.join(', ');

        // Insertamos justo antes del cierre del corchete ']'
        recorder.insertLeft(arrayNode.getEnd() - 1, newText);
      }
    }

    tree.commitUpdate(recorder);
    return tree;
  };
}