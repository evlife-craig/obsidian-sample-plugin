#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const DEV_VAULT_DIR = "dev-vault";
const PLUGIN_DIR = path.join(
	DEV_VAULT_DIR,
	".obsidian",
	"plugins",
	"mythic-gme-plugin"
);
const PROJECT_ROOT = process.cwd();

console.log("🎲 Setting up Mythic GME Plugin development vault...\n");

// Create dev-vault directory structure
console.log("📁 Creating dev-vault directory structure...");
const dirs = [
	DEV_VAULT_DIR,
	path.join(DEV_VAULT_DIR, ".obsidian"),
	path.join(DEV_VAULT_DIR, ".obsidian", "plugins"),
];

dirs.forEach((dir) => {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
		console.log(`   ✓ Created ${dir}`);
	} else {
		console.log(`   ⊙ ${dir} already exists`);
	}
});

// Create Test Note.md
console.log("\n📝 Creating Test Note.md...");
const testNoteContent = `# Test Note for Mythic GME Plugin

This note is for testing oracle roll insertions.

## Test Section

Place your cursor here and insert oracle results:

---

## Roll History

`;

const testNotePath = path.join(DEV_VAULT_DIR, "Test Note.md");
if (!fs.existsSync(testNotePath)) {
	fs.writeFileSync(testNotePath, testNoteContent);
	console.log("   ✓ Created Test Note.md");
} else {
	console.log("   ⊙ Test Note.md already exists");
}

// Create symlink to project root
console.log("\n🔗 Setting up symlink...");
if (fs.existsSync(PLUGIN_DIR)) {
	const stats = fs.lstatSync(PLUGIN_DIR);
	if (stats.isSymbolicLink()) {
		console.log("   ⊙ Symlink already exists");
	} else {
		console.log(
			"   ⚠ Directory exists but is not a symlink. Please remove it manually."
		);
		process.exit(1);
	}
} else {
	try {
		// Use relative path for better portability
		const relativePath = path.relative(
			path.dirname(PLUGIN_DIR),
			PROJECT_ROOT
		);

		if (process.platform === "win32") {
			// Windows requires different approach
			execSync(`mklink /D "${PLUGIN_DIR}" "${PROJECT_ROOT}"`, {
				stdio: "inherit",
			});
		} else {
			// Unix-like systems (macOS, Linux)
			fs.symlinkSync(relativePath, PLUGIN_DIR, "dir");
		}
		console.log(`   ✓ Created symlink: ${PLUGIN_DIR} -> ${PROJECT_ROOT}`);
	} catch (error) {
		console.error("   ✗ Failed to create symlink:", error.message);
		console.log(
			"\n   You may need to run this script with elevated permissions:"
		);
		console.log("   - macOS/Linux: sudo npm run setup-dev");
		console.log("   - Windows: Run as Administrator");
		process.exit(1);
	}
}

// Create .obsidian/workspace.json for better initial state
console.log("\n⚙️  Creating workspace configuration...");
const workspaceConfig = {
	main: {
		id: "main",
		type: "split",
		children: [
			{
				id: "test-note",
				type: "leaf",
				state: {
					type: "markdown",
					state: {
						file: "Test Note.md",
						mode: "source",
					},
				},
			},
		],
	},
	left: {
		id: "left",
		type: "split",
		children: [],
		collapsed: true,
	},
	right: {
		id: "right",
		type: "split",
		children: [],
		collapsed: true,
	},
};

const workspacePath = path.join(DEV_VAULT_DIR, ".obsidian", "workspace.json");
if (!fs.existsSync(workspacePath)) {
	fs.writeFileSync(workspacePath, JSON.stringify(workspaceConfig, null, 2));
	console.log("   ✓ Created workspace.json");
} else {
	console.log("   ⊙ workspace.json already exists");
}

console.log("\n✅ Development vault setup complete!\n");
console.log("📋 Next steps:");
console.log('   1. Run "npm run dev" to start the build watcher');
console.log("   2. Open the dev-vault folder in Obsidian");
console.log(
	'   3. Enable the "Mythic GME Oracles" plugin in Settings > Community plugins'
);
console.log("   4. Use Ctrl/Cmd + R to reload Obsidian after making changes\n");
