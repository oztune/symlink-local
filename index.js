const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')
const chalk = require('chalk')
const yargs = require('yargs')
const args = yargs
	.option('verbose', {
		alias: 'v',
		default: false
	})
	.option('dry-run', {
		alias: 'd',
		default: false
	})
	.argv

const parseModules = require('./parseModules')
const findConnections = require('./findConnections')

const currentDir = process.cwd()
const dir = path.resolve(process.cwd(), (args._[0] || '.'))
const dryRun = args.dryRun
const verbose = args.verbose

const modules = parseModules(dir)
const connections = findConnections(modules)

console.log('\nLinking all local modules in', dir)
if (dryRun) console.log('DRY RUN')
console.log('')

// Go through every project and symlink its dependents
let i = 0
for (let moduleName in modules) {
	++i

	const module = modules[moduleName]
	const dependentPath = path.resolve(dir, module.directory)

	console.log(i + ') ' + chalk.bold(path.relative(currentDir, dependentPath)) + (module.directory === moduleName ? '' : (' ' + chalk.dim(moduleName))))

	const dependencies = connections.dependencies[moduleName]
	if (!dependencies || dependencies.length === 0) {
		if (verbose) {
			console.log(chalk.dim('No local dependencies'))
		}
		continue
	}

	// Where to link it into
	const dependentNodeModulesPath = path.resolve(dependentPath, 'node_modules')
	if (!fs.existsSync(dependentNodeModulesPath)) {
		fs.mkdirSync(dependentNodeModulesPath)
	}

	for (let dependencyName of dependencies) {
		const depModule = modules[dependencyName]
		if (!depModule) throw new Error('Found a dependency in connections, but not in modules ' + dependencyName)

		// Path to the actual dependency
		const dependencyPath = path.resolve(dir, depModule.directory)
		// Path where we want to create the symlink
		const symlinkPath = path.resolve(dependentNodeModulesPath, dependencyName)

		// If the folder already exist, delete it
		// or skip if it's already the correct symlink
		try {
			const stat = fs.statSync(symlinkPath)
			if (stat.isDirectory()) {
				const realPath = fs.realpathSync(symlinkPath)
				if (realPath === dependencyPath) {
					// This is already established, skip
					if (verbose) {
						console.log(chalk.dim('[already linked]', dependencyName))// symlinkPath)
					}
					continue
				} else {
					// This folder is bad, delete it
					if (verbose) {
						console.log(chalk.red('[delete]'), symlinkPath)
					}
					if (!dryRun) {
						rimraf.sync(symlinkPath)
					}
				}
			}
		} catch (e) {
			// File doesn't exist, all good
		}

		// Create the link
		console.log(chalk.green('[symlink]'), path.relative(dependentPath, symlinkPath), ' <- ./' + path.relative(dir, dependencyPath))
		if (!dryRun) {
			fs.symlinkSync(dependencyPath, symlinkPath)
		}
	}
}