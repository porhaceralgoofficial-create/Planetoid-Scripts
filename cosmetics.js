// Cosmetics Management System

class CosmeticsManager {
    constructor() {
        this.pickaxeEffects = [];
        this.walkTrailEffects = [];
        this.menu = {};
    }

    addPickaxeEffect(effect) {
        this.pickaxeEffects.push(effect);
    }

    removePickaxeEffect(effect) {
        const index = this.pickaxeEffects.indexOf(effect);
        if (index > -1) {
            this.pickaxeEffects.splice(index, 1);
        }
    }

    addWalkTrailEffect(effect) {
        this.walkTrailEffects.push(effect);
    }

    removeWalkTrailEffect(effect) {
        const index = this.walkTrailEffects.indexOf(effect);
        if (index > -1) {
            this.walkTrailEffects.splice(index, 1);
        }
    }

    setMenu(menu) {
        this.menu = menu;
    }

    openMenu() {
        console.log('Menu opened:', this.menu);
    }

    closeMenu() {
        console.log('Menu closed');
    }
}

// Example usage
const cosmeticsManager = new CosmeticsManager();

cosmeticsManager.addPickaxeEffect('Shiny');
cosmeticsManager.addWalkTrailEffect('Sparkle');
cosmeticsManager.setMenu({ title: 'Cosmetics Menu', options: [] });

cosmeticsManager.openMenu();