"use strict";
import * as Parameter from 'parameter';

const p = new Parameter();

// 基础校验
const baseRuleMap = {
  'int': { type: 'int', required: true },
  'int?': { type: 'int', required: false },
  'integer': { type: 'integer', required: true },
  'number': { type: 'number', required: true },
  'date': { type: 'date', required: true },
  'dateTime': { type: 'dateTime', required: true },
  'id': { type: 'id', required: true },
  'boolean': { type: 'boolean', required: true },
  'bool': { type: 'bool', required: true },
  'string': { type: 'string', required: true, allowEmpty: false },
  'string?': { type: 'string', required: false, allowEmpty: true },
  'email': { type: 'email', required: true, allowEmpty: false },
  'password': { type: 'password', required: true, allowEmpty: false, min: 6 },
  'object': { type: 'object', required: true },
  'array': { type: 'array', required: true },
  'enum': { type: 'enum' },
};

// 数组校验
const arrayRuleMap: object = {
  'array+': { type: 'array', min: 1, require: true },
  'array+?': { type: 'array', min: 1, require: false },
  '[]+': { type: 'array', min: 1, require: true },
  '[]]+?': { type: 'array', min: 1, require: false },
  'string[]': { type: 'array', itemType: 'string', require: true },
  'string[]+': { type: 'array', itemType: 'string', require: true, min: 1 },
  'string[]?': { type: 'array', itemType: 'string', require: false },
  'string[]+?': { type: 'array', itemType: 'string', require: false, min: 1 },

  'number[]': { type: 'array', itemType: 'number', require: true },
  'number[]+': { type: 'array', itemType: 'number', require: true, min: 1 },
  'number[]?': { type: 'array', itemType: 'number', require: false },
  'number[]+?': { type: 'array', itemType: 'number', require: false, min: 1 },

  'int[]': { type: 'array', itemType: 'int', require: true },
  'int[]+': { type: 'array', itemType: 'int', require: true, min: 1 },
  'int[]?': { type: 'array', itemType: 'int', require: false },
  'int[]+?': { type: 'array', itemType: 'int', require: false, min: 1 },

  'integer[]': { type: 'array', itemType: 'int', require: true },
  'integer[]+': { type: 'array', itemType: 'int', require: true, min: 1 },
  'integer[]?': { type: 'array', itemType: 'int', require: false },
  'integer[]+?': { type: 'array', itemType: 'int', require: false, min: 1 },

  'object[]': { type: 'array', itemType: 'object', require: true },
  'object[]+': { type: 'array', itemType: 'object', require: true, min: 1 },
  'object[]?': { type: 'array', itemType: 'object', require: false },
  'object[]+?': { type: 'array', itemType: 'object', require: false, min: 1 },

  'obj[]': { type: 'array', itemType: 'object', require: true },
  'obj[]+': { type: 'array', itemType: 'object', require: true, min: 1 },
  'obj[]?': { type: 'array', itemType: 'object', require: false },
  'obj[]+?': { type: 'array', itemType: 'object', require: false, min: 1 },
};
for (const k in arrayRuleMap) {
  Parameter.addRule(k, (_, v) => Parameter.TYPE_MAP.array.call(p, arrayRuleMap[k], v));
}

// 身份证校验
Parameter.addRule('idCard', (_, idCard) => {
  idCard = idCard.toUpperCase();
  let city = {
    11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁",
    22: "吉林", 23: "黑龙江 ", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽",
    35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北 ", 43: "湖南", 44: "广东",
    45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏 ",
    61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外 "
  };
  if (!idCard || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(idCard)) {
    return p.t('idCard format error');
  } else if (!city[idCard.substr(0, 2)]) {
    return p.t('idCard address code error');
  } else {
    // 18位身份证需要验证最后一位校验位if(code.length == 18){
    let codeArray = idCard.split('');
    // ∑(ai×Wi)(mod 11)//加权因子
    let factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    //校验位
    let parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    let ai = 0;
    let wi = 0;
    for (let i = 0; i < 17; i++) {
      ai = codeArray[i];
      wi = factor[i];
      sum += ai * wi;
    }
    if (parity[sum % 11] + '' !== codeArray[17]) {
      return p.t('idCard verify bit error');
    }
  }
});


interface ErrHandle {
    (message: string);
}

export class Validator {

  private parameter: Parameter;
  private errHandle: ErrHandle;

  constructor() {
    this.errHandle = (msg) => {
      throw new Error(msg);
    };
    this.parameter = new Parameter();
  }

  configure(errHandle: ErrHandle) {
    this.errHandle = errHandle;
  }

  validate(rules, data) {
    for (const field in rules) {
      const err = this._validate({ [field]: rules[field] }, data);
      if (err) {
        return err;
      }
    }
  }

  private _validate(rule, data) {
    let errors = this.parameter.validate(rule, data);
    if (errors) {
      if (rule.message) {
        return this.errHandle(rule.message);
      }
      let [err] = errors;
      return this.errHandle(`[${err.code}] field:${err.field} ${err.message}`);
    }
  }

}

export const validator = new Validator();

export function makeValidRule(ruleKey, attachRule: any = {}): object {
  // 基础规则
  if (baseRuleMap.hasOwnProperty(ruleKey)) {
    return { ...attachRule, ...baseRuleMap[ruleKey] };
  }
  // 数组规则
  if (arrayRuleMap.hasOwnProperty(ruleKey)) {
    return { ...attachRule, ...arrayRuleMap[ruleKey] };
  }

  switch (ruleKey) {
    case 'idCard':
      return { ...attachRule, ...{ type: 'idCard' } };
  }

  return {};
}

export function enumRule(values, attachRule = {}): object {
  return { ...attachRule, ...{ type: 'enum', values } };
}

export function arrayRule(itemType, rule = {}, attachRule = {}): object {
  return { ...attachRule, ...{ type: 'array', itemType, rule } };
}

export function objectRule(rule, attachRule = {}): object {
  return { ...attachRule, ...{ type: 'object', rule } };
}

