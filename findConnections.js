module.exports = function (modules) {
	const moduleDependents = {}
	const moduleDependencies = {}
	const parseDependencies = (moduleName, dependencies) => {
		if (!dependencies) return

		let arr = moduleDependencies[moduleName]
		if (!arr) moduleDependencies[moduleName] = arr = []
		arr.push(...Object.keys(dependencies).filter(moduleName => modules[moduleName]))

		// Not needed right now
		for (let dependentModuleName in dependencies) {
			if (!modules[dependentModuleName]) continue
			let dependents = moduleDependents[dependentModuleName]
			if (!dependents) {
				moduleDependents[dependentModuleName] = dependents = new Set()
			}
			dependents.add(moduleName)
		}
	}

	for (let moduleName in modules) {
		const package = modules[moduleName].package
		parseDependencies(moduleName, package.dependencies)
		parseDependencies(moduleName, package.devDependencies)
		parseDependencies(moduleName, package.peerDependencies)
	}

	return { dependencies: moduleDependencies, dependents: moduleDependents }
}