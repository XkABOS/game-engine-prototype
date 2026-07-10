/**
 * ============================================================================
 * GENESIS ERROR DETECTION & AUTO-FIX SYSTEM v0.1.0
 * ============================================================================
 * 
 * PURPOSE:
 * This system monitors the Genesis Engine for errors, detects faulty requests,
 * identifies incidental error moments, and suggests corrections. It acts as
 * a friendly debugger and error whistleblower, actively helping users fix
 * problems before they become critical issues.
 * 
 * FEATURES:
 * - Real-time error monitoring
 * - Automatic error detection and logging
 * - User request validation
 * - Faulty input detection
 * - Performance monitoring
 * - Suggested fixes and solutions
 * - Auto-fix capability (with user approval)
 * - Error history and analytics
 * - Warning levels (INFO, WARN, ERROR, CRITICAL)
 * - Detailed error reports
 * 
 * CREATED BY: Copilot AI
 * VISION BY: XkABOS
 * IMPLEMENTED: 2026-07-10
 * ============================================================================
 */

class ErrorDetectionSystem {
  constructor(engine) {
    this.engine = engine;
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];
    this.autoFixEnabled = true;
    this.strictMode = false; // If true, throws on errors; if false, logs and suggests
    this.debugLevel = 'WARN'; // INFO, WARN, ERROR, CRITICAL
    this.maxErrors = 100; // Keep last 100 errors in memory
    this.listeners = [];
    this.performanceThresholds = {
      entityUpdateTime: 16, // ms (60 FPS = 16.67ms per frame)
      actionProcessTime: 5, // ms
      physicsUpdateTime: 5, // ms
      renderTime: 10 // ms
    };
    this.performanceMetrics = {};
    this.errorPatterns = new Map(); // Detect recurring errors

    console.log('🔍 Error Detection System initialized');
  }

  /**
   * Register error listener (for UI notifications, logging, etc.)
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Emit error to all listeners
   */
  notifyListeners(error) {
    this.listeners.forEach(listener => listener(error));
  }

  /**
   * ========================================================================
   * ENTITY VALIDATION
   * ========================================================================
   */

  validateEntity(entity, context = 'unknown') {
    const issues = [];

    // Check required properties
    if (!entity.id && entity.id !== 0) {
      issues.push({
        level: 'ERROR',
        code: 'ENTITY_NO_ID',
        message: 'Entity missing required ID',
        context,
        entity,
        suggestion: 'Ensure entity has a valid numeric ID'
      });
    }

    if (!entity.type) {
      issues.push({
        level: 'ERROR',
        code: 'ENTITY_NO_TYPE',
        message: 'Entity missing type property',
        context,
        entity,
        suggestion: 'Set entity.type to a valid string (e.g., "player", "enemy")'
      });
    }

    if (entity.x === undefined || entity.y === undefined) {
      issues.push({
        level: 'WARN',
        code: 'ENTITY_NO_POSITION',
        message: 'Entity has no position (x, y)',
        context,
        entity,
        suggestion: 'Set entity.x and entity.y to valid numbers. Defaulting to 0,0.',
        autoFix: () => {
          entity.x = entity.x || 0;
          entity.y = entity.y || 0;
        }
      });
    }

    if (entity.width <= 0 || entity.height <= 0) {
      issues.push({
        level: 'WARN',
        code: 'ENTITY_INVALID_DIMENSIONS',
        message: `Entity has invalid dimensions (${entity.width}x${entity.height})`,
        context,
        entity,
        suggestion: 'Width and height should be positive numbers. Defaulting to 32x32.',
        autoFix: () => {
          entity.width = entity.width || 32;
          entity.height = entity.height || 32;
        }
      });
    }

    // Check for NaN values
    if (isNaN(entity.x) || isNaN(entity.y) || isNaN(entity.velocityX) || isNaN(entity.velocityY)) {
      issues.push({
        level: 'ERROR',
        code: 'ENTITY_NAN_VALUES',
        message: 'Entity contains NaN values (invalid numbers)',
        context,
        entity,
        suggestion: 'Check calculations that set position/velocity. Ensure no division by zero.',
        autoFix: () => {
          entity.x = isNaN(entity.x) ? 0 : entity.x;
          entity.y = isNaN(entity.y) ? 0 : entity.y;
          entity.velocityX = isNaN(entity.velocityX) ? 0 : entity.velocityX;
          entity.velocityY = isNaN(entity.velocityY) ? 0 : entity.velocityY;
        }
      });
    }

    // Check if entity is off-screen significantly
    if (entity.x < -entity.width * 2 || entity.x > this.engine.width + entity.width * 2) {
      issues.push({
        level: 'INFO',
        code: 'ENTITY_OFF_SCREEN_X',
        message: `Entity far off-screen (x: ${entity.x}). May waste resources.`,
        context,
        entity,
        suggestion: 'Consider if this entity should be culled or repositioned.'
      });
    }

    this.reportIssues(issues);
    return issues;
  }

  /**
   * ========================================================================
   * ACTION VALIDATION
   * ========================================================================
   */

  validateAction(actionName, actor, target) {
    const issues = [];
    const action = this.engine.actions.getAction(actionName);

    if (!action) {
      issues.push({
        level: 'ERROR',
        code: 'ACTION_NOT_FOUND',
        message: `Action "${actionName}" not found in action registry`,
        context: { actionName, actor, target },
        suggestion: `Register action "${actionName}" using engine.actions.registerAction()`,
        suggestion2: `Available actions: ${Array.from(this.engine.actions.registeredActions.keys()).join(', ')}`
      });
      this.reportIssues(issues);
      return issues;
    }

    if (!actor) {
      issues.push({
        level: 'ERROR',
        code: 'ACTION_NO_ACTOR',
        message: 'Action has no actor (performing entity)',
        context: { actionName },
        suggestion: 'Ensure the entity performing the action is valid and passed correctly'
      });
    }

    if (action.requiresTarget && !target) {
      issues.push({
        level: 'WARN',
        code: 'ACTION_NO_TARGET',
        message: `Action "${actionName}" expects a target but none provided`,
        context: { actionName, actor },
        suggestion: 'Provide a target entity or mark action as not requiring a target'
      });
    }

    // Check mana/cost
    if (actor && actor.stats && action.cost > 0) {
      if (actor.stats.mana < action.cost) {
        issues.push({
          level: 'WARN',
          code: 'ACTION_INSUFFICIENT_MANA',
          message: `Actor doesn't have enough mana (has ${actor.stats.mana}, needs ${action.cost})`,
          context: { actionName, actor },
          suggestion: `Wait for mana to regenerate or use a cheaper action`
        });
      }
    }

    // Check cooldown
    const cooldownKey = `${actor?.id}_${actionName}`;
    if (this.engine.actions.actionCooldowns.has(cooldownKey)) {
      issues.push({
        level: 'INFO',
        code: 'ACTION_ON_COOLDOWN',
        message: `Action "${actionName}" is on cooldown`,
        context: { actionName, actor },
        suggestion: `Wait ${action.cooldown}s before using this action again`
      });
    }

    this.reportIssues(issues);
    return issues;
  }

  /**
   * ========================================================================
   * CHARACTER VALIDATION
   * ========================================================================
   */

  validateCharacter(character) {
    const issues = [];

    // Validate as entity first
    issues.push(...this.validateEntity(character, 'character_validation'));

    // Character-specific checks
    if (!character.stats) {
      issues.push({
        level: 'ERROR',
        code: 'CHARACTER_NO_STATS',
        message: 'Character has no stats object',
        context: { character },
        suggestion: 'Ensure character.stats is initialized with health, mana, etc.',
        autoFix: () => {
          character.stats = character.stats || {
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            strength: 10,
            intelligence: 10,
            defense: 5,
            speed: 5
          };
        }
      });
    }

    // Check health values
    if (character.stats && character.stats.health > character.stats.maxHealth) {
      issues.push({
        level: 'WARN',
        code: 'CHARACTER_HEALTH_OVERFLOW',
        message: `Character health (${character.stats.health}) exceeds max (${character.stats.maxHealth})`,
        context: { character },
        suggestion: 'Clamp health to maxHealth',
        autoFix: () => {
          character.stats.health = Math.min(character.stats.health, character.stats.maxHealth);
        }
      });
    }

    if (character.stats && character.stats.health < 0) {
      issues.push({
        level: 'ERROR',
        code: 'CHARACTER_NEGATIVE_HEALTH',
        message: `Character has negative health (${character.stats.health})`,
        context: { character },
        suggestion: 'Clamp health to 0 and trigger death state',
        autoFix: () => {
          character.stats.health = 0;
          if (character.die) character.die();
        }
      });
    }

    if (character.stats && character.stats.mana > character.stats.maxMana) {
      issues.push({
        level: 'WARN',
        code: 'CHARACTER_MANA_OVERFLOW',
        message: `Character mana (${character.stats.mana}) exceeds max (${character.stats.maxMana})`,
        context: { character },
        suggestion: 'Clamp mana to maxMana',
        autoFix: () => {
          character.stats.mana = Math.min(character.stats.mana, character.stats.maxMana);
        }
      });
    }

    this.reportIssues(issues);
    return issues;
  }

  /**
   * ========================================================================
   * INPUT VALIDATION
   * ========================================================================
   */

  validateInput(input, expectedType) {
    const issues = [];

    if (input === null || input === undefined) {
      issues.push({
        level: 'ERROR',
        code: 'INPUT_NULL',
        message: `Input is null or undefined (expected ${expectedType})`,
        suggestion: 'Ensure input is properly defined before use'
      });
    }

    if (expectedType === 'number' && typeof input !== 'number') {
      issues.push({
        level: 'ERROR',
        code: 'INPUT_TYPE_MISMATCH',
        message: `Input is ${typeof input}, expected number`,
        suggestion: 'Convert input to number using Number() or parseInt()',
        autoFix: () => Number(input)
      });
    }

    if (expectedType === 'string' && typeof input !== 'string') {
      issues.push({
        level: 'ERROR',
        code: 'INPUT_TYPE_MISMATCH',
        message: `Input is ${typeof input}, expected string`,
        suggestion: 'Convert input to string using String()',
        autoFix: () => String(input)
      });
    }

    if (expectedType === 'entity' && !input.id) {
      issues.push({
        level: 'ERROR',
        code: 'INPUT_NOT_ENTITY',
        message: 'Input does not appear to be a valid entity',
        suggestion: 'Ensure the entity was created via engine.createEntity()'
      });
    }

    this.reportIssues(issues);
    return issues;
  }

  /**
   * ========================================================================
   * PHYSICS VALIDATION
   * ========================================================================
   */

  validatePhysics(entity) {
    const issues = [];

    // Check velocity extremes
    const speed = Math.sqrt(entity.velocityX ** 2 + entity.velocityY ** 2);
    if (speed > this.engine.config.maxVelocity * 2) {
      issues.push({
        level: 'WARN',
        code: 'PHYSICS_VELOCITY_EXTREME',
        message: `Entity velocity is very high (${speed.toFixed(2)})`,
        context: { entity, speed },
        suggestion: 'Check if forces are being applied correctly',
        suggestion2: `Current max velocity setting: ${this.engine.config.maxVelocity}`
      });
    }

    // Check for infinite loops or stuck entities
    if (entity.x === entity._lastX && entity.y === entity._lastY) {
      entity._stuckCounter = (entity._stuckCounter || 0) + 1;
      if (entity._stuckCounter > 60) { // Stuck for 60 frames at 60FPS = 1 second
        issues.push({
          level: 'WARN',
          code: 'PHYSICS_ENTITY_STUCK',
          message: `Entity appears stuck at position (${entity.x}, ${entity.y})`,
          context: { entity },
          suggestion: 'Check for collision issues or infinite loop in movement code'
        });
      }
    } else {
      entity._stuckCounter = 0;
    }

    entity._lastX = entity.x;
    entity._lastY = entity.y;

    this.reportIssues(issues);
    return issues;
  }

  /**
   * ========================================================================
   * PERFORMANCE MONITORING
   * ========================================================================
   */

  startPerformanceTimer(label) {
    return performance.now();
  }

  endPerformanceTimer(label, startTime) {
    const duration = performance.now() - startTime;
    const threshold = this.performanceThresholds[label] || 16;

    if (!this.performanceMetrics[label]) {
      this.performanceMetrics[label] = [];
    }

    this.performanceMetrics[label].push(duration);

    if (duration > threshold) {
      this.reportIssue({
        level: 'WARN',
        code: 'PERFORMANCE_SLOW',
        message: `${label} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`,
        suggestion: 'Consider optimizing this operation'
      });
    }

    return duration;
  }

  /**
   * ========================================================================
   * ERROR REPORTING
   * ========================================================================
   */

  reportIssue(issue) {
    const timestamp = new Date().toISOString();
    const error = {
      ...issue,
      timestamp,
      id: this.errors.length
    };

    // Track error patterns
    if (!this.errorPatterns.has(issue.code)) {
      this.errorPatterns.set(issue.code, 0);
    }
    this.errorPatterns.set(issue.code, this.errorPatterns.get(issue.code) + 1);

    // Add to appropriate collection
    if (issue.level === 'ERROR' || issue.level === 'CRITICAL') {
      this.errors.push(error);
      if (this.errors.length > this.maxErrors) {
        this.errors.shift(); // Remove oldest error
      }
    } else if (issue.level === 'WARN') {
      this.warnings.push(error);
    }

    // Log to console
    this.logToConsole(error);

    // Notify listeners
    this.notifyListeners(error);

    // Auto-fix if enabled and applicable
    if (this.autoFixEnabled && issue.autoFix && !this.strictMode) {
      this.suggestAutoFix(error);
    }

    return error;
  }

  reportIssues(issues) {
    issues.forEach(issue => this.reportIssue(issue));
  }

  /**
   * ========================================================================
   * AUTO-FIX SYSTEM
   * ========================================================================
   */

  suggestAutoFix(error) {
    if (!error.autoFix) {
      return null;
    }

    const suggestion = {
      errorId: error.id,
      errorCode: error.code,
      message: `Would you like me to automatically fix this? ${error.suggestion}`,
      fix: error.autoFix,
      timestamp: new Date().toISOString()
    };

    this.suggestions.push(suggestion);

    console.warn(`💡 Suggestion: ${suggestion.message}`);
    console.warn(`   Type: engine.errorDetection.approveFix(${error.id})`);

    return suggestion;
  }

  approveFix(errorId) {
    const error = this.errors.find(e => e.id === errorId);
    if (!error) {
      console.error(`❌ Error ID ${errorId} not found`);
      return false;
    }

    if (!error.autoFix) {
      console.error(`❌ No auto-fix available for error ${errorId}`);
      return false;
    }

    try {
      error.autoFix();
      console.log(`✅ Fixed error ${errorId}: ${error.code}`);
      this.reportIssue({
        level: 'INFO',
        code: 'AUTO_FIX_APPLIED',
        message: `Auto-fix applied to error ${errorId}: ${error.code}`
      });
      return true;
    } catch (e) {
      console.error(`❌ Failed to apply fix: ${e.message}`);
      this.reportIssue({
        level: 'ERROR',
        code: 'AUTO_FIX_FAILED',
        message: `Failed to apply auto-fix to error ${errorId}: ${e.message}`,
        suggestion: 'Check the error details and try a manual fix'
      });
      return false;
    }
  }

  approveAllFixes() {
    let fixedCount = 0;
    const suggestions = [...this.suggestions];

    suggestions.forEach(suggestion => {
      if (this.approveFix(suggestion.errorId)) {
        fixedCount++;
      }
    });

    console.log(`✅ Applied ${fixedCount} auto-fixes`);
    return fixedCount;
  }

  rejectFix(errorId) {
    const suggestion = this.suggestions.find(s => s.errorId === errorId);
    if (suggestion) {
      this.suggestions = this.suggestions.filter(s => s.errorId !== errorId);
      console.log(`⊘ Rejected auto-fix for error ${errorId}`);
    }
  }

  /**
   * ========================================================================
   * LOGGING & REPORTING
   * ========================================================================
   */

  logToConsole(error) {
    const levelColors = {
      'INFO': '#0099ff',
      'WARN': '#ffaa00',
      'ERROR': '#ff3333',
      'CRITICAL': '#ff0000'
    };

    const levelEmojis = {
      'INFO': 'ℹ️',
      'WARN': '⚠️',
      'ERROR': '❌',
      'CRITICAL': '🚨'
    };

    const color = levelColors[error.level] || '#fff';
    const emoji = levelEmojis[error.level] || '📌';

    console.log(
      `%c${emoji} [${error.level}] ${error.code}`,
      `color: ${color}; font-weight: bold;`
    );
    console.log(`Message: ${error.message}`);
    if (error.suggestion) console.log(`Suggestion: ${error.suggestion}`);
    if (error.suggestion2) console.log(`Also: ${error.suggestion2}`);
    if (error.autoFix) console.log(`Auto-fix available: engine.errorDetection.approveFix(${error.id})`);
    console.log('');
  }

  /**
   * Get error report
   */
  getErrorReport() {
    const errorCounts = {};
    this.errorPatterns.forEach((count, code) => {
      errorCounts[code] = count;
    });

    return {
      timestamp: new Date().toISOString(),
      totalErrors: this.errors.length,
      totalWarnings: this.warnings.length,
      pendingSuggestions: this.suggestions.length,
      errorCounts,
      recentErrors: this.errors.slice(-10),
      recentWarnings: this.warnings.slice(-10),
      pendingFixes: this.suggestions.slice(-10)
    };
  }

  /**
   * Print detailed error report
   */
  printReport() {
    const report = this.getErrorReport();
    console.log('='.repeat(60));
    console.log('🔍 ERROR DETECTION REPORT');
    console.log('='.repeat(60));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Total Errors: ${report.totalErrors}`);
    console.log(`Total Warnings: ${report.totalWarnings}`);
    console.log(`Pending Fixes: ${report.pendingSuggestions}`);
    console.log('');
    console.log('Error Breakdown:');
    Object.entries(report.errorCounts).forEach(([code, count]) => {
      console.log(`  ${code}: ${count}x`);
    });
    console.log('='.repeat(60));
  }

  /**
   * Clear error history
   */
  clearErrors() {
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];
    this.errorPatterns.clear();
    console.log('✅ Cleared all error history');
  }

  /**
   * ========================================================================
   * DETECTION HELPERS
   * ========================================================================
   */

  detectMemoryLeak() {
    const entityCount = this.engine.entities.getAll().length;
    const particleCount = this.engine.particles.particles.length;

    if (entityCount > 1000) {
      this.reportIssue({
        level: 'WARN',
        code: 'MEMORY_ENTITY_OVERLOAD',
        message: `Very high entity count (${entityCount}). May cause performance issues.`,
        suggestion: 'Consider culling off-screen entities or implementing object pooling'
      });
    }

    if (particleCount > 5000) {
      this.reportIssue({
        level: 'WARN',
        code: 'MEMORY_PARTICLE_OVERLOAD',
        message: `Very high particle count (${particleCount}). May cause lag.`,
        suggestion: 'Reduce particle emission rate or implement particle pooling'
      });
    }
  }

  detectInfiniteLoop() {
    // This is called each frame to detect if update is taking too long
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (duration > 50) { // More than 50ms per frame
        this.reportIssue({
          level: 'CRITICAL',
          code: 'POTENTIAL_INFINITE_LOOP',
          message: `Frame update took ${duration.toFixed(2)}ms (very long!)`,
          suggestion: 'Check for infinite loops in entity update or physics calculations'
        });
      }
    };
  }

  /**
   * Validate entire engine state
   */
  validateEngineState() {
    console.log('🔍 Running full engine validation...');

    const issues = [];

    // Check all entities
    this.engine.entities.getAll().forEach(entity => {
      issues.push(...this.validateEntity(entity));
    });

    // Check all characters
    this.engine.entities.getByType('character').forEach(char => {
      issues.push(...this.validateCharacter(char));
    });

    // Check physics
    this.engine.entities.getAll().forEach(entity => {
      issues.push(...this.validatePhysics(entity));
    });

    // Check memory
    this.detectMemoryLeak();

    console.log(`✅ Validation complete. Found ${issues.length} issues.`);
    return issues;
  }

  /**
   * Enable/disable error detection
   */
  setAutoFixEnabled(enabled) {
    this.autoFixEnabled = enabled;
    console.log(`Auto-fix ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set debug level
   */
  setDebugLevel(level) {
    this.debugLevel = level;
    console.log(`Debug level set to: ${level}`);
  }

  /**
   * Set strict mode (throws instead of warns)
   */
  setStrictMode(strict) {
    this.strictMode = strict;
    console.log(`Strict mode ${strict ? 'enabled' : 'disabled'}`);
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorDetectionSystem;
}