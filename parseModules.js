const fs = require('fs')
const path = require('path')

module.exports = function parseModules (dir) {
	const fileNames = fs.readdirSync(dir)
	const modules = {}

	// Step 1: Find all the projects
	for (let fileName of fileNames) {
		const fileStats = fs.statSync(path.resolve(dir, fileName))
		if (fileStats.isDirectory()) {
			try {
				const packageString = fs.readFileSync(path.resolve(dir, fileName, 'package.json'))
				const package = JSON.parse(packageString.toString())

				if (package.name) {
					// If we got here, it's a folder with
					// package.json.
					modules[package.name] = {
						directory: fileName,
						package
					}
				} else {
					console.warn('Skipping ' + fileName + '. Found a package.json file with no name field')
				}
			} catch (e) {

			}
		}
	}

	return modules
}