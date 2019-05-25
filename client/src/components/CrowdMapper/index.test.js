import React from 'react';
import ReactDOM from 'react-dom';
import Index from './index.js';
import renderer from 'react-test-renderer';

test('render', () => {
  const component = renderer.create(<Index />);
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})
