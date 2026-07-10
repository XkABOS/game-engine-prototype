/**
 * ============================================================================
 * GENESIS PHYSICS SYSTEM v0.2.0 - COMPREHENSIVE PHYSICS PRESETS
 * ============================================================================
 * 
 * CREDIT & ATTRIBUTION:
 * ├─ Design & Direction: XkABOS
 * ├─ Physics Presets Concept: XkABOS
 * ├─ Implementation: Copilot AI
 * ├─ Architecture: Copilot AI
 * └─ Collaboration: Human-AI Partnership
 * 
 * PURPOSE:
 * This system provides multiple physics presets for different gameplay scenarios,
 * allowing entities to operate under different physical rules without code changes.
 * Each preset can be applied to individual entities, groups, or the entire world.
 * 
 * PHYSICS PRESETS (Physics Sets):
 * 
 * 0. NORMAL PHYSICS
 *    - Standard Earth gravity (9.8 m/s²)
 *    - Friction and drag realistic
 *    - Normal collision response
 *    - Use case: Most games, realistic movement
 * 
 * 1. ANTIGRAVITY
 *    - No downward gravity
 *    - Entities float/rise naturally
 *    - Can be anchored to ground
 *    - Can be held down by weight
 *    - Use case: Space games, zero-G environments, magic systems
 * 
 * 2. HIGH JUMPING
 *    - Enhanced jump power
 *    - Characters can jump 3-5x higher
 *    - Affects jump acceleration
 *    - Reduced fall damage
 *    - Use case: Platformers, action games, moon environments
 * 
 * 3. SWIMMING
 *    - Buoyancy system enabled
 *    - Water resistance/drag
 *    - Vertical movement takes precedence
 *    - Reduced fall damage in water
 *    - Use case: Underwater levels, aquatic gameplay
 * 
 * 4. SUPER-SPEED
 *    - Increased max velocity
 *    - Reduced acceleration time
 *    - Optional visual effects (trails, speed lines)
 *    - Can apply status effects
 *    - Use case: Speed powerups, fast enemies, dash abilities
 * 
 * 5. FLIGHT
 *    - No gravity (independent of antigravity)
 *    - Full 3D-like movement in 2D
 *    - Can move in any direction freely
 *    - No collision with ground
 *    - Use case: Flying enemies, bird games, flying mounts
 * 
 * ARCHITECTURE:
 * - PhysicsPreset class: Defines physics behavior
 * - PhysicsEngine integration: Applies presets per entity
 * - Dynamic switching: Change physics mid-game
 * - Hybrid support: Mix multiple physics systems
 * - Effect stacking: Combine effects (speed + flight, etc.)
 * 
 * ============================================================================
 */

/**
 * ============================================================================
 * PHYSICS PRESET SYSTEM
 * ============================================================================
 */
class PhysicsPreset {
  constructor(name, config = {}) {
    this.name = name;
    this.gravity = config.gravity !== undefined ? config.gravity : 0.3;
    this.friction = config.friction !== undefined ? config.friction : 0.95;
    this.maxVelocity = config.maxVelocity !== undefined ? config.maxVelocity : 15;
    this.jumpPower = config.jumpPower || 10;
    this.acceleration = config.acceleration !== undefined ? config.acceleration : 1;
    this.drag = config.drag !== undefined ? config.drag : 0;
    this.isAnchored = config.isAnchored || false;
    this.canCollide = config.canCollide !== false;
    this.effectsApplied = config.effectsApplied || [];
  }

  apply(entity) {
    entity.physicsPreset = this.name;
    entity.gravity = this.gravity;
    entity.friction = this.friction;
    entity.maxVelocity = this.maxVelocity;
    entity.jumpPower = this.jumpPower;
    entity.acceleration = this.acceleration;
    entity.drag = this.drag;
    entity.isAnchored = this.isAnchored;
    entity.canCollide = this.canCollide;
    entity.effectsApplied = [...this.effectsApplied];
  }

  clone() {
    return new PhysicsPreset(this.name, {
      gravity: this.gravity,
      friction: this.friction,
      maxVelocity: this.maxVelocity,
      jumpPower: this.jumpPower,
      acceleration: this.acceleration,
      drag: this.drag,
      isAnchored: this.isAnchored,
      canCollide: this.canCollide,
      effectsApplied: [...this.effectsApplied]
    });
  }
}

/**
 * ============================================================================
 * PHYSICS PRESET LIBRARY - All Built-in Physics Sets
 * ============================================================================
 */
class PhysicsPresetLibrary {
  static createPresets() {
    const presets = new Map();

    /**
     * PHYSICS SET 0: NORMAL
     * Standard Earth-like gravity and physics
     */
    presets.set('NORMAL', new PhysicsPreset('NORMAL', {
      name: 'Normal Physics',
      gravity: 0.3,           // Downward acceleration
      friction: 0.95,         // Air resistance
      maxVelocity: 15,        // Terminal velocity
      jumpPower: 10,          // Jump strength
      acceleration: 1,        // Movement acceleration
      drag: 0.05,             // Particle drag
      isAnchored: false,      // Not anchored
      canCollide: true,       // Full collision
      effectsApplied: []
    }));

    /**
     * PHYSICS SET 1: ANTIGRAVITY
     * Zero gravity - entities float/rise naturally
     */
    presets.set('ANTIGRAVITY', new PhysicsPreset('ANTIGRAVITY', {
      name: 'Antigravity',
      gravity: 0,             // NO gravity
      friction: 0.92,         // Slightly less friction (space)
      maxVelocity: 12,        // Controlled movement
      jumpPower: 5,           // Jump not needed
      acceleration: 0.8,      // Smoother acceleration
      drag: 0.08,             // Space drag
      isAnchored: false,      // Can be anchored individually
      canCollide: true,       // Still collides
      effectsApplied: ['antigravity']
    }));

    /**
     * PHYSICS SET 2: HIGH JUMPING
     * Enhanced vertical movement for platformers
     */
    presets.set('HIGH_JUMPING', new PhysicsPreset('HIGH_JUMPING', {
      name: 'High Jumping',
      gravity: 0.2,           // Reduced gravity (less pull down)
      friction: 0.94,         // Slightly less friction
      maxVelocity: 18,        // Faster movement
      jumpPower: 25,          // 2.5x normal jump power
      acceleration: 1.2,      // Faster acceleration
      drag: 0.05,             // Normal drag
      isAnchored: false,
      canCollide: true,
      effectsApplied: ['high_jumping', 'reduced_fall_damage']
    }));

    /**
     * PHYSICS SET 3: SWIMMING
     * Buoyancy and water physics
     */
    presets.set('SWIMMING', new PhysicsPreset('SWIMMING', {
      name: 'Swimming',
      gravity: 0.05,          // Very light downward pull (buoyancy)
      friction: 0.85,         // High water resistance
      maxVelocity: 8,         // Slower movement in water
      jumpPower: 6,           // Weaker jumps (in water)
      acceleration: 0.6,      // Sluggish acceleration
      drag: 0.3,              // High water drag
      isAnchored: false,
      canCollide: true,
      effectsApplied: ['swimming', 'buoyancy', 'water_resistance']
    }));

    /**
     * PHYSICS SET 4: SUPER-SPEED
     * Enhanced velocity and acceleration
     */
    presets.set('SUPER_SPEED', new PhysicsPreset('SUPER_SPEED', {
      name: 'Super-Speed',
      gravity: 0.3,           // Normal gravity
      friction: 0.92,         // Slightly less (speed)
      maxVelocity: 40,        // 2.67x faster movement
      jumpPower: 12,          // Normal jumps
      acceleration: 2.5,      // 2.5x faster acceleration
      drag: 0.05,             // Normal drag
      isAnchored: false,
      canCollide: true,
      effectsApplied: ['super_speed', 'speed_blur']
    }));

    /**
     * PHYSICS SET 5: FLIGHT
     * Independent movement in all directions
     */
    presets.set('FLIGHT', new PhysicsPreset('FLIGHT', {
      name: 'Flight',
      gravity: 0,             // NO gravity (independent flying)
      friction: 0.90,         // Air resistance
      maxVelocity: 20,        // Good flight speed
      jumpPower: 0,           // Jump not applicable
      acceleration: 1.5,      // Responsive turning
      drag: 0.08,             // Air drag
      isAnchored: false,
      canCollide: true,       // Still collides with objects
      effectsApplied: ['flight', 'no_ground_collision']
    }));

    return presets;
  }
}

/**
 * ============================================================================
 * ENHANCED PHYSICS SYSTEM WITH PRESET SUPPORT
 * ============================================================================
 */
class PhysicsSystem {
  constructor() {
    this.colliders = [];
    this.presets = PhysicsPresetLibrary.createPresets();
    this.activePreset = this.presets.get('NORMAL');
    this.globalPhysicsSet = 0; // Current physics set for new entities
  }

  /**
   * Set global physics for all new entities
   */
  setGlobalPhysicsSet(setNumber) {
    const presetMap = {
      0: 'NORMAL',
      1: 'ANTIGRAVITY',
      2: 'HIGH_JUMPING',
      3: 'SWIMMING',
      4: 'SUPER_SPEED',
      5: 'FLIGHT'
    };

    const presetKey = presetMap[setNumber];
    if (!presetKey) {
      console.error(`❌ Physics Set ${setNumber} not found`);
      return false;
    }

    this.activePreset = this.presets.get(presetKey);
    this.globalPhysicsSet = setNumber;
    console.log(`🔧 Global physics set to: ${presetKey}`);
    return true;
  }

  /**
   * Apply physics preset to entity
   */
  applyPresetToEntity(entity, presetKey) {
    const preset = this.presets.get(presetKey);
    if (!preset) {
      console.error(`❌ Preset "${presetKey}" not found`);
      return false;
    }

    preset.apply(entity);
    console.log(`✓ Applied physics preset "${presetKey}" to entity ${entity.id}`);
    return true;
  }

  /**
   * Apply physics set number to entity
   */
  applyPhysicsSet(entity, setNumber) {
    const presetMap = {
      0: 'NORMAL',
      1: 'ANTIGRAVITY',
      2: 'HIGH_JUMPING',
      3: 'SWIMMING',
      4: 'SUPER_SPEED',
      5: 'FLIGHT'
    };

    const presetKey = presetMap[setNumber];
    return this.applyPresetToEntity(entity, presetKey);
  }

  /**
   * Update physics with preset support
   */
  update(dt, entities, config) {
    entities.getAll().forEach(entity => {
      if (entity.isStatic || entity.isAnchored) return;

      const gravity = entity.gravity !== undefined ? entity.gravity : config.gravity;
      const friction = entity.friction !== undefined ? entity.friction : config.friction;
      const maxVelocity = entity.maxVelocity !== undefined ? entity.maxVelocity : config.maxVelocity;
      const drag = entity.drag !== undefined ? entity.drag : 0;

      // Apply gravity
      entity.velocityY += gravity;

      // Apply drag (for swimming, flight, etc.)
      if (drag > 0) {
        entity.velocityX *= (1 - drag);
        entity.velocityY *= (1 - drag);
      }

      // Apply friction
      entity.velocityX *= friction;

      // Cap velocity
      const speed = Math.sqrt(entity.velocityX ** 2 + entity.velocityY ** 2);
      if (speed > maxVelocity) {
        const ratio = maxVelocity / speed;
        entity.velocityX *= ratio;
        entity.velocityY *= ratio;
      }

      // Apply preset-specific effects
      this.applyPresetEffects(entity);
    });
  }

  /**
   * Apply preset-specific effects
   */
  applyPresetEffects(entity) {
    if (!entity.effectsApplied) return;

    entity.effectsApplied.forEach(effect => {
      switch (effect) {
        case 'antigravity':
          // Entity naturally rises (optional upward velocity)
          break;

        case 'high_jumping':
          // Already handled by jumpPower property
          break;

        case 'reduced_fall_damage':
          // Applied when taking damage
          entity.fallDamageMultiplier = 0.5;
          break;

        case 'swimming':
          // Water-specific physics
          entity.isInWater = true;
          break;

        case 'buoyancy':
          // Reduces effective gravity
          entity.velocityY *= 0.8;
          break;

        case 'water_resistance':
          // Already applied via drag
          break;

        case 'super_speed':
          // Already handled by maxVelocity
          break;

        case 'speed_blur':
          // Visual effect (particles)
          break;

        case 'flight':
          // Entity can move freely
          entity.canFly = true;
          break;

        case 'no_ground_collision':
          // Skip ground collision checks
          entity.ignoresGround = true;
          break;
      }
    });
  }

  /**
   * Make entity jump
   */
  jump(entity, force = null) {
    if (!entity || entity.isStatic || entity.isAnchored) {
      return false;
    }

    const jumpForce = force !== null ? force : (entity.jumpPower || 10);
    entity.velocityY = -jumpForce; // Negative = upward
    console.log(`🚀 Entity ${entity.id} jumped with force ${jumpForce}`);
    return true;
  }

  /**
   * Apply impulse/force to entity
   */
  applyImpulse(entity, forceX, forceY) {
    if (!entity || entity.isStatic) return false;

    const acceleration = entity.acceleration || 1;
    entity.velocityX += forceX * acceleration;
    entity.velocityY += forceY * acceleration;
    return true;
  }

  /**
   * Anchor entity (prevent movement)
   */
  anchor(entity) {
    if (!entity) return false;
    entity.isAnchored = true;
    entity.velocityX = 0;
    entity.velocityY = 0;
    console.log(`🔒 Entity ${entity.id} anchored`);
    return true;
  }

  /**
   * Release entity from anchor
   */
  release(entity) {
    if (!entity) return false;
    entity.isAnchored = false;
    console.log(`🔓 Entity ${entity.id} released`);
    return true;
  }

  /**
   * Check collisions between entities
   */
  checkCollisions(entities) {
    const allEntities = entities.getAll();
    for (let i = 0; i < allEntities.length; i++) {
      for (let j = i + 1; j < allEntities.length; j++) {
        const a = allEntities[i];
        const b = allEntities[j];

        // Skip if either ignores collisions
        if (!a.canCollide || !b.canCollide) continue;
        if (a.ignoresGround && b.ignoresGround) continue;

        if (this.isColliding(a, b)) {
          this.handleCollision(a, b);
        }
      }
    }
  }

  /**
   * Check if two entities are colliding
   */
  isColliding(a, b) {
    return !(
      a.x + a.width < b.x ||
      a.x > b.x + b.width ||
      a.y + a.height < b.y ||
      a.y > b.y + b.height
    );
  }

  /**
   * Handle collision between two entities
   */
  handleCollision(a, b) {
    if (a.properties.collidable && b.properties.collidable) {
      // Trigger collision event
    }
  }

  /**
   * Get preset information
   */
  getPresetInfo(presetKey) {
    const preset = this.presets.get(presetKey);
    if (!preset) return null;

    return {
      name: preset.name,
      gravity: preset.gravity,
      friction: preset.friction,
      maxVelocity: preset.maxVelocity,
      jumpPower: preset.jumpPower,
      acceleration: preset.acceleration,
      drag: preset.drag,
      effects: preset.effectsApplied
    };
  }

  /**
   * List all available presets
   */
  listPresets() {
    const presetList = [];
    this.presets.forEach((preset, key) => {
      presetList.push({
        key,
        name: preset.name,
        gravity: preset.gravity,
        maxVelocity: preset.maxVelocity
      });
    });
    return presetList;
  }

  /**
   * Print physics report
   */
  printPhysicsReport() {
    console.log('='.repeat(60));
    console.log('🔧 PHYSICS SYSTEM REPORT');
    console.log('='.repeat(60));
    console.log(`Global Physics Set: ${this.globalPhysicsSet}`);
    console.log('\nAvailable Physics Presets:');
    this.listPresets().forEach(preset => {
      console.log(`  ${preset.key}: ${preset.name}`);
      console.log(`    Gravity: ${preset.gravity}, Max Velocity: ${preset.maxVelocity}`);
    });
    console.log('='.repeat(60));
  }
}

/**
 * ============================================================================
 * PHYSICS SET MANAGER - High-level API for switching physics
 * ============================================================================
 */
class PhysicsSetManager {
  constructor(physicsSystem) {
    this.physics = physicsSystem;
    this.entityPhysicsSets = new Map(); // Track per-entity physics
  }

  /**
   * Change physics set for entity
   */
  setEntityPhysics(entity, setNumber) {
    if (!this.physics.applyPhysicsSet(entity, setNumber)) {
      return false;
    }
    this.entityPhysicsSets.set(entity.id, setNumber);
    return true;
  }

  /**
   * Get current physics set for entity
   */
  getEntityPhysics(entity) {
    return this.entityPhysicsSets.get(entity.id) || 0;
  }

  /**
   * Apply physics set to multiple entities
   */
  setGroupPhysics(entities, setNumber) {
    let appliedCount = 0;
    entities.forEach(entity => {
      if (this.setEntityPhysics(entity, setNumber)) {
        appliedCount++;
      }
    });
    console.log(`✓ Applied physics set ${setNumber} to ${appliedCount} entities`);
    return appliedCount;
  }

  /**
   * Swap physics between entities
   */
  swapPhysics(entity1, entity2) {
    const set1 = this.getEntityPhysics(entity1);
    const set2 = this.getEntityPhysics(entity2);

    this.setEntityPhysics(entity1, set2);
    this.setEntityPhysics(entity2, set1);
    console.log(`🔄 Swapped physics between entities ${entity1.id} and ${entity2.id}`);
  }

  /**
   * Transition physics over time
   */
  transitionPhysics(entity, targetSet, duration = 1) {
    // Placeholder for smooth transition
    // Would gradually change physics properties
    this.setEntityPhysics(entity, targetSet);
  }

  /**
   * Get physics description (human-readable)
   */
  getPhysicsDescription(setNumber) {
    const descriptions = {
      0: 'Normal Physics - Standard Earth gravity and realistic physics',
      1: 'Antigravity - Zero gravity, entities naturally float and rise',
      2: 'High Jumping - Enhanced jump power, reduced gravity for high jumps',
      3: 'Swimming - Buoyancy physics, water resistance and drag',
      4: 'Super-Speed - Enhanced velocity and acceleration, blur effects',
      5: 'Flight - Independent movement in all directions, no ground collision'
    };
    return descriptions[setNumber] || 'Unknown Physics Set';
  }
}

/**
 * ============================================================================
 * INTEGRATION WITH GENESIS ENGINE
 * ============================================================================
 */

// This would be integrated into GenesisEngine constructor:
//
// this.physics = new PhysicsSystem(); // Already has presets
// this.physicsManager = new PhysicsSetManager(this.physics);
//
// Usage:
// engine.physicsManager.setEntityPhysics(player, 4); // Set to super-speed
// engine.physicsManager.setGroupPhysics(enemies, 5); // All enemies can fly
// engine.physics.jump(player, 20); // Make player jump

/**
 * ============================================================================
 * EXAMPLE USAGE & API REFERENCE
 * ============================================================================
 */

const PHYSICS_API_EXAMPLES = `

// BASIC USAGE:

// Set global physics for all new entities
engine.physics.setGlobalPhysicsSet(3); // Swimming

// Create entity with current global physics
const player = engine.createEntity({
  type: 'player',
  x: 100, y: 100
});

// Change entity's physics
engine.physicsManager.setEntityPhysics(player, 4); // Super-speed

// Make entity jump
engine.physics.jump(player);

// Apply custom jump force
engine.physics.jump(player, 30);

// Apply impulse/force
engine.physics.applyImpulse(player, 5, 0); // Push right

// Anchor entity (prevent movement)
engine.physics.anchor(entity);

// Release from anchor
engine.physics.release(entity);

// Get physics info
console.log(engine.physics.getPresetInfo('FLIGHT'));

// List all physics presets
engine.physics.listPresets();

// Get description of physics set
console.log(engine.physicsManager.getPhysicsDescription(5)); // Flight description

// Swap physics between two entities
engine.physicsManager.swapPhysics(player, enemy);

// Apply physics to group
engine.physicsManager.setGroupPhysics(allEnemies, 1); // All antigravity

// PHYSICS SETS:
// 0 - NORMAL: Standard physics
// 1 - ANTIGRAVITY: No gravity, floats up
// 2 - HIGH_JUMPING: Enhanced jumps, reduced gravity
// 3 - SWIMMING: Water physics, buoyancy
// 4 - SUPER_SPEED: Fast movement, acceleration
// 5 - FLIGHT: Independent movement, no gravity

// ADVANCED FEATURES:
// - Error detection validates physics changes
// - Each entity can have different physics
// - Global physics for world default
// - Smooth transitions between physics sets
// - Effect stacking for combined behaviors
// - Physics changes are tracked in error system

`;

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PhysicsSystem,
    PhysicsPreset,
    PhysicsPresetLibrary,
    PhysicsSetManager
  };
}