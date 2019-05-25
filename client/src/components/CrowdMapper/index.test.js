import React from 'react';
import Index from './index.js';
import renderer from 'react-test-renderer';

test('rendering UI', () => {
  const component = renderer.create(<Index />);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})
