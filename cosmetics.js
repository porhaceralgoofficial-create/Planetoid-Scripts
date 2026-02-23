// cosmetics.js - A cosmetics management system with a menu interface and particle effects

// Particle effects for pickaxe
function createPickaxeEffect() {
    const particleSystem = new ParticleSystem();
    // Add some particles
    particleSystem.addParticles({ type: 'sparkle', count: 100 });
    // Set up effect
    particleSystem.setPosition(player.position);
    particleSystem.start();
}

// Particle effects for walk trails
function createWalkTrailEffect() {
    const trailEffect = new TrailEffect();
    trailEffect.setColor('blue');
    trailEffect.setLength(10);
    // Link the effect to player movement
    player.onMove = () => {
        trailEffect.addPoint(player.position);
        trailEffect.display();
    };
}

// Menu interface for cosmetics management
function openCosmeticsMenu() {
    const menu = new Menu();
    menu.addOption('Pickaxe Effects', createPickaxeEffect);
    menu.addOption('Walk Trail Effects', createWalkTrailEffect);
    menu.addOption('Close Menu', menu.close);
    menu.display();
}

// Event listener to open the menu
document.addEventListener('keydown', (e) => {
    if (e.key === 'C') {
        openCosmeticsMenu();
    }
});