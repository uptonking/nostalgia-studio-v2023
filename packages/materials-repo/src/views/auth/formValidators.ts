/** 验证规则 映射表 */
export const validators = {
  email: {
    rules: [
      {
        test: /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,})$/i,
        message: '只支持邮箱格式，如 abc@x.yz',
      },
    ],
    errors: [],
    valid: false,
    state: '',
  },
  password: {
    rules: [
      {
        test: (value) => {
          return value.length >= 6;
        },
        message: '密码不能小于6位',
      },
      {
        test: /^[a-zA-Z0-9_]+$/,
        message: '无效密码，只支持字母数字下划线',
      },
    ],
    errors: [],
    valid: false,
    state: '',
  },
  username: {
    rules: [
      {
        test: /^[a-zA-Z0-9]+$/i,
        message: '只支持字母和数字，不支持特殊字符',
      },
    ],
    errors: [],
    valid: false,
    state: '',
  },
};

/** 检查fieldName是否符合验证规则 */
export function validateField(validators, fieldName, value) {
  validators[fieldName].errors = [];
  validators[fieldName].state = value;
  validators[fieldName].valid = true;
  validators[fieldName].rules.forEach((rule) => {
    if (rule.test instanceof RegExp) {
      if (!rule.test.test(value)) {
        validators[fieldName].errors.push(rule.message);
        validators[fieldName].valid = false;
      }
    } else if (typeof rule.test === 'function') {
      if (!rule.test(value)) {
        validators[fieldName].errors.push(rule.message);
        validators[fieldName].valid = false;
      }
    }
  });
}

/** 只需要参数中指定的几个fieldTypes符合验证规则，就可以提交form了 */
export function isFormValid(validators, fieldTypes = ['username', 'password']) {
  let status = true;
  Object.keys(validators).forEach((field) => {
    if (fieldTypes.includes(field)) {
      if (!validators[field].valid) {
        status = false;
      }
    }
  });
  return status;
}

// export default validators;
