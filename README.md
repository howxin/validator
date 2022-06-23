# validator

基于parameter的校验工具


```js
const vv = new Validator();

vv.configure((errMsg) => {
  console.log('err: ', errMsg)
});

const rules = {
    a: 'string[]',
    b: arrayRule('string', { required: false }),
    c: makeValidRule('idCard'),
};

console.log(vv.validate(rules, {
    a: ['1'],
    b: [1],
    c: '442211199209260056'
}));
```