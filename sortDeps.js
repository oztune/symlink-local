// Not needed right now
// Sort the projects by dependencies
module.exports = function (modules) {
	const moduleNames = Object.keys(modules)
	while (moduleNames.length > 0) {
		const moduleName = moduleNames.shift()

		// Check if it has any deps
		const dependencies = moduleDependencies[moduleName]
		if (dependencies.some(name => moduleNames.indexOf(name) >= 0)) {
			moduleNames.push(moduleName)
		} else {
			// This module has all the dependencies
			console.log(moduleName, '<-', dependencies.join(','))
		}
	}
}