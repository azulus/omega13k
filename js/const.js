const ShapeGeneratorConst = {
  MIRRORED_SHIP: 'm',
  INVERTED_MIRRORED_SHIP: 'mv'
};

const ShaderConst = {
  VERTEX_SHADER: 'v',
  FRAGMENT_SHADER: 'f'
};

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

const PathConst = {
  MIN_SHIPS: 2,
  MAX_SHIPS: 7
};

const GameConst = {
  WIDTH: 800,
  HEIGHT: 600,
  SHIP_WIDTH: 50,
  SHIP_HEIGHT: 50
};

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

const ObjectTypeIndex = {
  PLAYER: 0,
  PLAYER_PROJECTILE: 1,
  ENEMY: 2,
  ENEMY_PROJECTILE: 3
}

const BoundingBoxIndex = {
  POSITION_X: 0,
  POSITION_Y: 1,
  WIDTH: 2,
  HEIGHT: 3
};

const ShapeIndex = {
    COLOR: 0,
    RADIUS: 1,
    POINTS: 2,
    BOUNDING_BOX: 3
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

const EnemyConfigIndex = {
  SEED: 0,
  SEED_SHAPE_STR: 1
};

const LevelSpecConst = {
  ON_ENTER: '0',
  ON_EXIT: '1'
};

const VectorShaderConst = {
  STARFIELD: `
    attribute vec2 pos;
    void main() {
      gl_Position = vec4(pos, 0, 1);
    }
  `,
  TWO_DIMENSION: `
  attribute vec2 a_position;
  uniform vec2 u_resolution;

  void main() {
     vec2 zeroToOne = a_position / u_resolution;
     vec2 zeroToTwo = zeroToOne * 2.0;
     vec2 clipSpace = zeroToTwo - 1.0;
     gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  }
  `
};

const FragmentShaderConst = {
  STARFIELD: `
    precision mediump float;
    uniform vec3 resolution;
    uniform float globalTime;

    void main()
    {
      vec2 uv=gl_FragCoord.xy/resolution.xy-.5;
      uv.y*=resolution.y/resolution.x;

      vec3 dir=vec3(uv*0.8,1.);
      float time=globalTime*0.0005+.25;

      vec3 from=vec3(1.,-1.,0.);
      from+=vec3(time*2.,0.,0.);

      float s=0.1,fade=1.;
      vec3 v=vec3(0.);
      for (int r=0; r<20; r++) {
        vec3 p=from+s*dir*.5;
        p = abs(vec3(0.85)-mod(p,vec3(0.85*2.)));
        float pa,a=pa=0.;
        for (int i=0; i<18; i++) {
          p=abs(p)/dot(p,p)-0.53;
          a+=abs(length(p)-pa);
          pa=length(p);
        }
        float dm=max(0.,0.3-a*a*.001);
        a*=a*a;
        if (r>6) fade*=1.-dm;
        v+=fade;
        v+=vec3(s,s*s,s*s*s*s)*a*0.0015*fade;
        fade*=0.68;
        s+=0.1;
      }
      v=mix(vec3(length(v)),v,0.85);
      gl_FragColor = vec4(v*.01,1.);
    }
  `,
  TWO_DIMENSION: `
  precision mediump float;

  uniform vec4 u_color;

  void main() {
     gl_FragColor = u_color;
  }
`
};
