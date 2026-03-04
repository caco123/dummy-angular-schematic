import { Rule, SchematicContext, SchematicsException, TaskId, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { getPackageJsonDependency } from '@schematics/angular/utility/dependencies';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function ngAdd(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const dep = getPackageJsonDependency(tree, '@angular/core');

    if (!dep) {
      context.logger.error('@angular/core package missing');
      return tree;
    }

    let taskId: TaskId | undefined = context.addTask(new RunSchematicTask('install-packages', {}));

    if (!taskId) {
      throw new SchematicsException(
        'No se ha ejecutado ninguna tarea de aprovisionamiento'
      );
    }

    context.addTask(new NodePackageInstallTask(), [taskId]);

    return tree;
  };
}
