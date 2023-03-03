const assert = require('assert');
const rewire = require('rewire');

describe('@someimportantcompany/github-actions-ini-config', () => {
  const action = rewire('./index');

  const mockCore = ({
    inputs = {},
    outputs = {},
    variables = {},
    stdout = [],
  } = {}) => ({
    getInput: key => inputs[key] || '',
    getOutput: key => outputs[key] || null,
    setOutput: (key, value) => outputs[key] = value,
    getFailed: () => outputs.failed || null,
    setFailed: value => outputs.failed = value,
    exportVariable: (key, value) => variables[key] = value,
    debug: value => stdout.push(value),
    info: value => stdout.push(value),
    getStdout: () => stdout || [],
  });

  it('should parse a dud ini string', async () => {
    const core = {
      inputs: {
        config: (a => a.join('\n'))([
          '; Ini comment by user',
          '[section]',
          'hello = world',
        ]),
      },
      outputs: {},
      variables: {},
      stdout: [],
    };

    await action.__with__({ core: mockCore(core) })(() => action());

    assert.deepStrictEqual(core, {
      inputs: core.inputs,
      outputs: {},
      variables: {},
      stdout: [
        '{"section":{"hello":"world"}}',
        '{"env":{},"outputs":{}}',
      ],
    });
  });

  it('should parse a simple ini string', async () => {
    const core = {
      inputs: {
        config: (a => a.join('\n'))([
          '; Ini comment by user',
          '[env]',
          'hello = world',
          '[outputs]',
          'hello = world',
        ]),
      },
      outputs: {},
      variables: {},
      stdout: [],
    };

    await action.__with__({ core: mockCore(core) })(() => action());

    assert.deepStrictEqual(core, {
      inputs: core.inputs,
      outputs: {
        hello: 'world',
      },
      variables: {
        HELLO: 'world',
      },
      stdout: [
        '{"env":{"hello":"world"},"outputs":{"hello":"world"}}',
        '{"env":{"hello":"world"},"outputs":{"hello":"world"}}',
        'export HELLO=world',
        'outputs.hello = world',
      ],
    });
  });

  it('should parse a simple ini string with matching sections', async () => {
    const core = {
      inputs: {
        config: (a => a.join('\n'))([
          '; Ini comment by user',
          '[(true).env]',
          'hello = world',
          '[(true).outputs]',
          'hello = world',
        ]),
      },
      outputs: {},
      variables: {},
      stdout: [],
    };

    await action.__with__({ core: mockCore(core) })(() => action());

    assert.deepStrictEqual(core, {
      inputs: core.inputs,
      outputs: {
        hello: 'world',
      },
      variables: {
        HELLO: 'world',
      },
      stdout: [
        '{"(true)":{"env":{"hello":"world"},"outputs":{"hello":"world"}}}',
        '{"env":{"hello":"world"},"outputs":{"hello":"world"}}',
        'export HELLO=world',
        'outputs.hello = world',
      ],
    });
  });

  it('should catch an invalid ini string', async () => {
    const core = {
      inputs: {
        config: JSON.stringify({
          hello: 'world',
          not_a: 'ini-string',
        }),
      },
      outputs: {},
      variables: {},
      stdout: [],
    };

    await action.__with__({ core: mockCore(core) })(() => action());

    assert.deepStrictEqual(core, {
      inputs: core.inputs,
      outputs: {},
      variables: {},
      stdout: [
        '{"{\\"hello\\":\\"world\\",\\"not_a\\":\\"ini-string\\"}":true}',
        '{"env":{},"outputs":{}}',
      ],
    });
  });

});
