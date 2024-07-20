global.chrome = {
    runtime: {
      onInstalled: {
        addListener: jest.fn(),
      },
      onMessage: {
        addListener: jest.fn(),
      },
      onStartup: {
        addListener: jest.fn(),
      },
      sendMessage: jest.fn(),
    },
    storage: {
      sync: {
        set: jest.fn(),
        get: jest.fn(),
      },
      local: {
        set: jest.fn(),
        get: jest.fn(),
      },
    },
    alarms: {
      create: jest.fn(),
      clear: jest.fn(),
      onAlarm: {
        addListener: jest.fn(),
      },
    },
  };
  
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  }));