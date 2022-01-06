# design tokens for theme halfmoon

# overview

- design tokens are mostly copied from [halfmoon_v1.1.1_MIT_202103](https://github.com/halfmoonui/halfmoon/tree/develop)

# roadmap

- 拼接类似border/padding/shadow的样式值

# issues

- 默认button的hover状态，边框显示黑色

# color

- style-dictionary不支持名为value的中间属性名，如`{ "color": { "font": { "value": "#111" , "secondary": { "value": "#333" }, } } }`
  - 若在中间设置了value属性，则同级和下级属性都不会输出了
  - 变通方案：对要输出的中间属性名，增加一个中间属性名 `.val`

- color变量的value值
  - 若包含outputAsItIs配置，则跳过颜色转换原样输出，适合作为通用变量
    - 对其他类型的值，会执行默认的color/css转换计算
- 不能直接修改css变量颜色值的alpha透明度
  - 但可以 `--color: 240, 240, 240;` `color: rgba(var(--color), 0.8);`
  - 问题是前者不是style-dictionary合法的颜色值
  - 无法动态修改css变量的颜色值，同时又让style-dictionary读取这个更改，因为s-d的应用场景是统一管理设计变量，值明确的变量，css vars过于灵活

- halfmoon的颜色变量
  - --blue-color-hsl:var(--c-h), var(--c-s), 10%
    - --blue-color:hsl(var(--blue-color-hsl))
    - 注意对于kv声明，只有后一个是合法的css样式值，所以用户只用后者，前者只被开发者内部使用
  - --dm-base-text-color: hsla(var(--white-color-hsl), 0.8); 
    - 此颜色由浏览器动态添加透明度，s-d难以实现，因为两个变量都要输出，而s-d需要输出的变量一般是合法的有效值(token)

- 书写hsl格式的color时要注意
- 不支持带头明度的值，hsla
- 对不包含变量引用的hsl裸数字值，s-d默认会自动转换，
  - 若hsl都为字符串，会正常输出
  - 若h为数字，则css vars获取引用时，要使用 `dictionary.getReference(p.original.value.h.toString())`
  - 对s, l用字符串即可，支持 `50%/50/0.5` 三种形式，但用自定义工具hslToHex时注意参数格式要求
- 对包含变量引用的hsl，
  - 若hsl属性值hslobjwithref包含引用，则必须用50%，不能用50或0.5

hsla(240, 100%, 50%, .05)     /*   5% opaque blue */ 
hsla(240, 100%, 50%, .4)      /*  40% opaque blue */ 
hsla(240, 100%, 50%, 1)       /* full opaque blue */ 
hsl(240, 100%, 50%)           /* 不透明度默认为1，即默认是不透明的 */

# naming

- css变量命名时，使用text-color而不是color来增强语义

- halfmoon的color变量中，hsl属性名的值不包含`hsl(`的前缀，若加上则s-d可以自动转换格式
- halfmoon的颜色变量命名深浅的修改
  - very-light > lighter
  - very-dim > dimmer
