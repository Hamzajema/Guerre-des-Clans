class Unit {
    constructor(config) {
        this.type = config.type;
        this.name = this.getUnitName(config.type);
        this.player = config.player;
        this.id = config.id || `p${config.player}-${config.type}-${Math.floor(Math.random() * 1000)}`;
        this.health = config.health;
        this.damage = config.damage;
        this.defense = config.defense;
        this.range = config.range;
        this.imageUrl = config.imageUrl || `../assets/images/${this.getUnitName(config.type)}.png`;
        this.maxHealth = config.health; // Store initial health as max health
    }

    getUnitName(type) {
        const names = {
            warrior: "Guerrier",
            archer: "Archer",
            mage: "Mage"
        };
        return names[type] || type;
    }

    takeDamage(damage) {
        // Calculate actual damage after defense reduction
        const actualDamage = Math.max(1, damage - this.defense);
        this.health = Math.max(0, this.health - actualDamage);
        return actualDamage;
    }

    isDead() {
        return this.health <= 0;
    }

    calculateAttackDamage(targetUnit) {
        return this.damage;
    }

    static createFromType(unitType, player, id) {
        const unitTypes = {
            warrior: {
                health: 30,
                damage: 10,
                defense: 5,
                range: 1,
                imageUrl: "../assets/images/Guerrier.png",
            },
            archer: {
                health: 20,
                damage: 8,
                defense: 2,
                range: 3,
                imageUrl: "../assets/images/Archer.png",
            },
            mage: {
                health: 15,
                damage: 12,
                defense: 1,
                range: 2,
                imageUrl: "../assets/images/Mage.png",
            }
        };

        const template = unitTypes[unitType];
        if (!template) {
            throw new Error(`Unknown unit type: ${unitType}`);
        }

        return new Unit({
            type: unitType,
            player: player,
            id: id || `p${player}-${unitType}-${Math.floor(Math.random() * 1000)}`,
            ...template
        });
    }

    static getHealth(type) {
        console.log(`getHealth called with type: ${type}`);
        
        if (type == "warrior") return 30;
        else if (type == "archer") return 20;
        else if (type == "mage") return 15;
        else return 0;
    }

    clone() {
        return new Unit({
            type: this.type,
            player: this.player,
            id: `${this.id}-clone`,
            health: this.health,
            damage: this.damage,
            defense: this.defense,
            range: this.range,
            imageUrl: this.imageUrl
        });
    }
}

class Clan {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.units = config.units;
        this.advantage = config.advantage;

        // Any bonus effects for this clan
        this.bonuses = config.bonuses || {};
    }

    applyBonusesToUnit(unit) {
        // Make a copy of the unit to avoid modifying the original
        const enhancedUnit = unit.clone();

        // Apply clan-specific bonuses
        if (this.id === "mountains" && this.bonuses.bonusDefense) {
            enhancedUnit.defense += this.bonuses.bonusDefense;
        } else if (this.id === "plains" && unit.type === "archer" && this.bonuses.bonusArcherAccuracy) {
            // For plains, archer accuracy could translate to damage
            enhancedUnit.damage += this.bonuses.bonusArcherAccuracy;
        } else if (this.id === "sages" && unit.type === "mage" && this.bonuses.bonusMageDamage) {
            enhancedUnit.damage += this.bonuses.bonusMageDamage;
        }

        return enhancedUnit;
    }

    generateUnits(player) {
        const units = [];

        for (const unitType in this.units) {
            for (let i = 0; i < this.units[unitType]; i++) {
                const unit = Unit.createFromType(unitType, player, `p${player}-${unitType}-${i}`);
                const enhancedUnit = this.applyBonusesToUnit(unit);
                units.push(enhancedUnit);
            }
        }

        return units;
    }

    static getAllClans() {
        return {
            mountains: new Clan({
                id: "mountains",
                name: "Clan des Montagnes",
                units: {
                    warrior: 3,
                    archer: 2,
                    mage: 1,
                },
                advantage: "Défense renforcée",
                bonuses: { bonusDefense: 1 }
            }),
            plains: new Clan({
                id: "plains",
                name: "Clan des Plaines",
                units: {
                    warrior: 2,
                    archer: 3,
                    mage: 1,
                },
                advantage: "Attaques à distance précises",
                bonuses: { bonusArcherAccuracy: 1 }
            }),
            sages: new Clan({
                id: "sages",
                name: "Clan des Sages",
                units: {
                    warrior: 1,
                    archer: 2,
                    mage: 3,
                },
                advantage: "Sorts puissants",
                bonuses: { bonusMageDamage: 2 }
            })
        };
    }

    static getClan(clanId) {
        return this.getAllClans()[clanId] || null;
    }
}

// Export the classes for use in other modules
export { Unit, Clan };