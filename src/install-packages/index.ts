import { Rule, Tree, chain } from '@angular-devkit/schematics';
import { NodeDependencyType, addPackageJsonDependency } from '@schematics/angular/utility/dependencies';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function installPackages(_options: any): Rule {
  return chain([
    installPackage(NodeDependencyType.Default, 'ngx-caco-image-splitter', 'latest'),
  ])
}

export function installPackage(type: NodeDependencyType, name: string, version: string): Rule {
  return (tree: Tree) => {
    addPackageJsonDependency(tree, { type, name, version });
    return tree;
  };
}