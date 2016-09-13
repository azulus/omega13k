// now alphabetized for your pleasure!

const AudioIndex = {
  WAVE_TYPE: 0,
  ATTACK_TIME: 1,
  SUSTAIN_TIME: 2,
  SUSTAIN_PUNCH: 3,
  DECAY_TIME: 4,
  START_FREQUENCY: 5,
  MIN_FREQUENCY: 6,
  SLIDE: 7,
  DELTA_SLIDE: 8,
  VIBRATO_DEPTH: 9,
  VIBRATO_SPEED: 10,
  CHANGE_AMOUNT: 11,
  CHANGE_SPEED: 12,
  SQUARE_DUTY: 13,
  DUTY_SWEEP: 14,
  REPEAT_SPEED: 15,
  PHASER_OFFSET: 16,
  PHASER_SWEEP: 17,
  LP_FILTER_CUTOFF: 18,
  LP_FILTER_CUTOFF_SWEEP: 19,
  LP_FILTER_RESONANCE: 20,
  HP_FILTER_CUTOFF: 21,
  HP_FILTER_CUTOFF_SWEEP: 22,
  MASTER_VOLUME: 23
};

const AudioConst = {
  ENEMY_PROJECTILE_POOL_SIZE: 5,
  ENEMY_EXPLOSION_POOL_SIZE: 3,
  PLAYER_PROJECTILE_POOL_SIZE: 3,
  PLAYER_EXPLOSION_POOL_SIZE: 3,
  REWIND_SOUND_DELAY: 50
};

const AudioPoolIndex = {
  PLAY: 0
};

const BackgroundConst = {
  SEED: 123,
  NUM_STARS: 500,
  MIN_BRIGHTNESS: 0.2,
  MAX_BRIGHTNESS: 0.8,
  MIN_VELOCITY: 0.01, // takes 10 minutes to cross screen = 10 * 60 * 1000 = 600000 ms to move 800
  MAX_VELOCITY: 0.2 // crosses screen in 10 seconds
}

const BoundingBoxIndex = {
  POSITION_X: 0,
  POSITION_Y: 1,
  WIDTH: 2,
  HEIGHT: 3
};

const CachedProgramIndex = {
  STARFIELD: 0,
  TWO_DIMENSION: 1,
  PROJECTILES: 2,
  PLUMES: 3
};

const CircleConst = {
  COMPONENT_TRIANGLES: 24
};

const DialogIndex = {
  START_TIME: 0,
  TEXT: 1
};

const DialogConst = {
  MS_PER_STEP: 150
};

const EnemyConfigIndex = {
  SEED: 0,
  SEED_SHAPE_STR: 1
};

const FragmentShaderConst = {
  PLUMES: `
  precision mediump float;
  varying vec3 vColor;
  varying float vLifetime;
  void main(void) {
   if(length(gl_PointCoord-vec2(0.5)) > 0.7)
    discard;
    gl_FragColor = vec4(vColor, 1.);
    gl_FragColor.a = vLifetime * .5;
  }
  `,
  STARFIELD: `
  precision mediump float;
  varying vec4 vColor;
  varying float vBrightness;
  void main(void) {
    gl_FragColor = vColor;
  }
  `,
  TWO_DIMENSION: `
  precision mediump float;

  uniform vec4 u_color;

  void main() {
     gl_FragColor = u_color;
  }
  `,
  PROJECTILES: `
  precision mediump float;
  varying vec3 vColor;
  void main(void) {
    float dist = length(gl_PointCoord-vec2(0.5));
    if(dist > 0.5)
    discard;
    gl_FragColor = vec4(vColor, 1.);
    gl_FragColor.a = 1. - dist;
  }
  `
};

const FramebufferIndex = {
  BACKGROUND: 0,
  SHIPS: 1,
  PROJECTILES: 2,
  STATUS: 3
};

const GameConst = {
  WIDTH: 800,
  HEIGHT: 600,
  STARFIELD_WIDTH: 128,
  STARFIELD_HEIGHT: 128,
  SHIP_WIDTH: 50,
  SHIP_HEIGHT: 50,
  HALF_SHIP_WIDTH: 25,
  HALF_SHIP_HEIGHT: 25
};

const GameLoopConst = {
  ACTIVE_ENEMY_MAX: 500,
  ACTIVE_PROJECTILE_MAX: 2000
};

const LevelPlayerIndex = {
  SHAPES: 1,
  HEALTH: 2,
  POSITION: 3,
  CHRONO_METER: 4
};

const LevelShipIndex = {
  START_TIME: 0,
  END_TIME: 1,
  KILL_TIME: 2,
  SHAPES: 3,
  PATH_DATA: 4,
  PROJECTILE_PATH: 5,
  PROJECTILE_TIMES: 6,
  NEXT_PROJECTILE: 7,
  BOUNDING_BOX: 8,
  EXPLOSION_AUDIO_POOL: 9,
  PROJECTILE_AUDIO_POOL: 10
};

const LevelSpecConst = {
  ENEMY_WAVE: 0,
  BOSS: 1,
  DIALOG: 2,
  END_SCREEN: 3,
};

// TODO: Remove?
const ObjectIndex = {
  SEED: 0,
  SEED_SHAPE_STR: 1,
  GENERATED_SHAPES: 2,
  DOM: 3,
  WIDTH: 4,
  HEIGHT: 5,
  POSITION_X: 6,
  POSITION_Y: 7,
  TICK: 8,
  DESTROYED: 9,
  OBJECT_TYPE: 10,
  PROJECTILE_COLLISION: 11
}

const PathConst = {
  MIN_SHIPS: 2,
  MAX_SHIPS: 7
};

const PathIndex = {
  SEGMENTS: 0,
  LAST_KNOWN_SEGMENT: 1
};

const PathSegmentIndex = {
  START_TIME: 0,
  END_TIME: 1,
  DURATION: 2,
  PERCENT_PER_MILLISECOND: 3,
  START_POINT: 4,
  END_POINT: 5,
  CONTROL_POINT: 6
};

const PlayerConst = {
  MAX_DIST_PER_MS: 0.5,
  ACCELERATION_PER_MS: 0.0025,
  SOUND_SEED: 102,
  SHAPE_SEED: 1037,
  PROJECTILE_SEED: 54,
  MS_BETWEEN_PROJECTILE_WAVES: 700,
  MAX_CHRONO_METER: 1000,
  CHRONO_USE_PER_MS: 0.1,
  CHRONO_RECOVERY_PER_MS: 0.02,
  STARTING_HEALTH: 100,
  MAX_HEALTH: 100,
  MAX_CHRONO: 1000,
  STARTING_CHRONO: 500
};

const PlumeConst = {
  MAX_PLUMES: 40
};

const ProjectilePathDirectionConst = {
  UP: 90,
  LEFT: 180,
  DOWN: 270,
  RIGHT: 360
};

const ProjectilePathIndex = {
  START_X: 0,
  START_Y: 1,
  X_PER_MS: 2,
  Y_PER_MS: 3,
  OFFSET_TIME: 4
};

const ShaderConst = {
  VERTEX_SHADER: 'v',
  FRAGMENT_SHADER: 'f'
};

const ShapeIndex = {
    COLOR: 0,
    RADIUS: 1,
    POINTS: 2,
    BOUNDING_BOX: 3,
    WEBGL_REPRESENTATION: 4,
    WEBGL_REPRESENTATION_LENGTH: 5
};

const ShapeGeneratorConst = {
  MIRRORED_SHIP: 'm',
  INVERTED_MIRRORED_SHIP: 'mv'
};

const SpeedConst = {
  REWIND: -4,
  PAUSE: 0,
  SLOW: 0.3,
  NORMAL: 1,
  FAST_FORWARD: 4
};

const StatusBarConst = {
  CHRONO_SEGMENTS: 9,
  CHRONO_Y_OFFSET: 16,
  CHRONO_HEIGHT: 6,
  CHRONO_COLOR: '#aaf',

  HEALTH_SEGMENTS: 20,
  HEALTH_Y_OFFSET: 5,
  HEALTH_HEIGHT: 6,
  HEALTH_COLOR: '#afa',

  BOSS_SEGMENTS: 40,
  BOSS_Y_OFFSET: 580,
  BOSS_HEIGHT: 10,
  BOSS_COLOR: '#f88',
};

const VectorShaderConst = {
  STARFIELD: `
  attribute vec4 aStar;
  uniform vec2 u_resolution;
  varying vec4 vColor;

  void main() {
    vec2 point = vec2(aStar[0], aStar[1]);
    vec2 zeroToOne = point / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, -1), 0., 1.);

    gl_PointSize=aStar[2]*1.2;
    vColor = vec4(1., 1., 1., aStar[2]);
  }
  `,
  PLUMES: `
    attribute vec4 aPos;

    uniform float uDirection;
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uOrigin;
    uniform vec2 uResolution;

    varying float vLifetime;
    varying vec3 vColor;

    void main(void) {
      float ti = mod(uTime + uOrigin[2], aPos[2]) * aPos[3];
      vec2 zeroToOne = vec2(uOrigin[0] + (uDirection*aPos[0]*ti), uOrigin[1] + aPos[1]) / uResolution;
      vec2 zeroToTwo = zeroToOne * 2.0;
      vec2 clipSpace = zeroToTwo - 1.0;
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

      vLifetime = 4.*ti*(1. - ti)*abs(uDirection);
      vColor = uColor;
      gl_PointSize = 5.;
    }
  `,
  TWO_DIMENSION: `
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  uniform vec2 u_offset;

  void main() {
     vec2 zeroToOne = (a_position + u_offset) / u_resolution;
     vec2 zeroToTwo = zeroToOne * 2.0;
     vec2 clipSpace = zeroToTwo - 1.0;
     gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  }
  `,
  PROJECTILES: `
  attribute vec2 aPoint;
  uniform vec2 u_resolution;
  uniform vec3 u_color;
  varying vec3 vColor;
  void main() {
     vec2 zeroToOne = aPoint / u_resolution;
     vec2 zeroToTwo = zeroToOne * 2.0;
     vec2 clipSpace = zeroToTwo - 1.0;

     gl_Position = vec4(clipSpace * vec2(1, -1), 0., 1.);

    gl_PointSize=10.;
    vColor = u_color;
  }
  `
};
