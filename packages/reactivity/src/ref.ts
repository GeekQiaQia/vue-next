import { track, trigger } from './effect'
import { TrackOpTypes, TriggerOpTypes } from './operations'
import { isArray, isObject, hasChanged } from '@vue/shared'
import { reactive, isProxy, toRaw, isReactive } from './reactive'
import { CollectionTypes } from './collectionHandlers'

declare const RefSymbol: unique symbol
// unique symbol 作为symbol的子类型，用作唯一key值；

export interface Ref<T = any> {
  value: T
  /**
   * Type differentiator only.
   * We need this to be in public d.ts but don't want it to show up in IDE
   * autocomplete, so we use a private Symbol instead.
   */
  [RefSymbol]: true
  /**
   * @internal
   */
  _shallow?: boolean
}

export type ToRef<T> = T extends Ref ? T : Ref<UnwrapRef<T>>
export type ToRefs<T = any> = {
  // #2687: somehow using ToRef<T[K]> here turns the resulting type into
  // a union of multiple Ref<*> types instead of a single Ref<* | *> type.
  [K in keyof T]: T[K] extends Ref ? T[K] : Ref<UnwrapRef<T[K]>>
}

const convert = <T extends unknown>(val: T): T =>
  isObject(val) ? reactive(val) : val

// isRef 函数的重载
export function isRef<T>(r: Ref<T> | unknown): r is Ref<T>
export function isRef(r: any): r is Ref {
  return Boolean(r && r.__v_isRef === true)
}

// ref 函数的重载
export function ref<T extends object>(value: T): ToRef<T>
export function ref<T>(value: T): Ref<UnwrapRef<T>>
export function ref<T = any>(): Ref<T | undefined>

/**
 * @description  // 创建ref对象；
 *
 */
export function ref(value?: unknown) {
  return createRef(value)
}

export function shallowRef<T extends object>(
  value: T
): T extends Ref ? T : Ref<T>
export function shallowRef<T>(value: T): Ref<T>
export function shallowRef<T = any>(): Ref<T | undefined>
export function shallowRef(value?: unknown) {
  return createRef(value, true)
}

// get set 对象属性访问器  创建一个Ref类
// 通过单独抽离出来的 track 进行依赖追踪， trigger 进行依赖通知；
class RefImpl<T> {
  private _value: T

  public readonly __v_isRef = true

  constructor(private _rawValue: T, public readonly _shallow = false) {
    this._value = _shallow ? _rawValue : convert(_rawValue)
  }

  get value() {
    track(toRaw(this), TrackOpTypes.GET, 'value')
    return this._value
  }

  set value(newVal) {
    if (hasChanged(toRaw(newVal), this._rawValue)) {
      this._rawValue = newVal
      this._value = this._shallow ? newVal : convert(newVal)
      trigger(toRaw(this), TriggerOpTypes.SET, 'value', newVal)
    }
  }
}

function createRef(rawValue: unknown, shallow = false) {
  if (isRef(rawValue)) {
    return rawValue
  }
  return new RefImpl(rawValue, shallow)
}
/**
 * @description trigger 对应 vue2中的notify
 *  调用 单独提取出的 trigger
 *
 */
export function triggerRef(ref: Ref) {
  trigger(toRaw(ref), TriggerOpTypes.SET, 'value', __DEV__ ? ref.value : void 0)
}
/**
 * @description unref: 直接获取引用对象的原值 value;
 * */

export function unref<T>(ref: T): T extends Ref<infer V> ? V : T {
  return isRef(ref) ? (ref.value as any) : ref
}
//  handlers
const shallowUnwrapHandlers: ProxyHandler<any> = {
  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key]
    // set 时 判断新值value 是否是 Ref 引用类型；
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value
      return true
    } else {
      return Reflect.set(target, key, value, receiver)
    }
  }
}
/**
 * @description 代理 Refs； new Proxy();
 * **/
export function proxyRefs<T extends object>(
  objectWithRefs: T
): ShallowUnwrapRef<T> {
  return isReactive(objectWithRefs)
    ? objectWithRefs
    : new Proxy(objectWithRefs, shallowUnwrapHandlers)
}
// 定义工厂函数类型 type
export type CustomRefFactory<T> = (
  track: () => void,
  trigger: () => void
) => {
  get: () => T
  set: (value: T) => void
}

class CustomRefImpl<T> {
  private readonly _get: ReturnType<CustomRefFactory<T>>['get']
  private readonly _set: ReturnType<CustomRefFactory<T>>['set']

  public readonly __v_isRef = true

  constructor(factory: CustomRefFactory<T>) {
    const { get, set } = factory(
      () => track(this, TrackOpTypes.GET, 'value'),
      () => trigger(this, TriggerOpTypes.SET, 'value')
    )
    this._get = get
    this._set = set
  }

  get value() {
    return this._get()
  }

  set value(newVal) {
    this._set(newVal)
  }
}
/**
 * @description 可通过工厂函数自定义Ref
 *
 */
export function customRef<T>(factory: CustomRefFactory<T>): Ref<T> {
  return new CustomRefImpl(factory) as any
}
/**
 * /**
 * @description 对象所有属性值的 ref 处理 ;
 * @param object
 * @param key
 *
 */

export function toRefs<T extends object>(object: T): ToRefs<T> {
  if (__DEV__ && !isProxy(object)) {
    console.warn(`toRefs() expects a reactive object but received a plain one.`)
  }
  const ret: any = isArray(object) ? new Array(object.length) : {}
  for (const key in object) {
    ret[key] = toRef(object, key)
  }
  return ret
}
/**
 * @description 对象属性值的 ref 实现 ;
 * @param object
 * @param key
 *
 */
class ObjectRefImpl<T extends object, K extends keyof T> {
  //  只读的 __v_isRef flag,标记当前值是否已经被Ref处理；
  public readonly __v_isRef = true
  // 构造函数初始化参数
  constructor(private readonly _object: T, private readonly _key: K) {}
  // 依旧通过对象访问器的方式进行get set
  get value() {
    return this._object[this._key]
  }

  set value(newVal) {
    this._object[this._key] = newVal
  }
}
/**
 * @deprecated 将一个对象的属性，进行Ref处理；  return object[key] || ObjectRefImpl(object,key)
 * @param object
 * @param key
 */
export function toRef<T extends object, K extends keyof T>(
  object: T,
  key: K
): ToRef<T[K]> {
  return isRef(object[key])
    ? object[key]
    : (new ObjectRefImpl(object, key) as any)
}

// corner case when use narrows type
// Ex. type RelativePath = string & { __brand: unknown }
// RelativePath extends object -> true
type BaseTypes = string | number | boolean

/**
 * This is a special exported interface for other packages to declare
 * additional types that should bail out for ref unwrapping. For example
 * \@vue/runtime-dom can declare it like so in its d.ts:
 *
 * ``` ts
 * declare module '@vue/reactivity' {
 *   export interface RefUnwrapBailTypes {
 *     runtimeDOMBailTypes: Node | Window
 *   }
 * }
 * ```
 *
 * Note that api-extractor somehow refuses to include `declare module`
 * augmentations in its generated d.ts, so we have to manually append them
 * to the final generated d.ts in our build process.
 */
export interface RefUnwrapBailTypes {}

export type ShallowUnwrapRef<T> = {
  [K in keyof T]: T[K] extends Ref<infer V> ? V : T[K]
}

export type UnwrapRef<T> = T extends Ref<infer V>
  ? UnwrapRefSimple<V>
  : UnwrapRefSimple<T>

type UnwrapRefSimple<T> = T extends
  | Function
  | CollectionTypes
  | BaseTypes
  | Ref
  | RefUnwrapBailTypes[keyof RefUnwrapBailTypes]
  ? T
  : T extends Array<any>
    ? { [K in keyof T]: UnwrapRefSimple<T[K]> }
    : T extends object ? UnwrappedObject<T> : T

// Extract all known symbols from an object
// when unwrapping Object the symbols are not `in keyof`, this should cover all the
// known symbols
// 将对象中的所有symbols 类型的key值进行提取,因为当展开一个对象的时候，
// symbols 类型的key 不再 keyof 中;
type SymbolExtract<T> = (T extends { [Symbol.asyncIterator]: infer V }
  ? { [Symbol.asyncIterator]: V }
  : {}) &
  (T extends { [Symbol.hasInstance]: infer V }
    ? { [Symbol.hasInstance]: V }
    : {}) &
  (T extends { [Symbol.isConcatSpreadable]: infer V }
    ? { [Symbol.isConcatSpreadable]: V }
    : {}) &
  (T extends { [Symbol.iterator]: infer V } ? { [Symbol.iterator]: V } : {}) &
  (T extends { [Symbol.match]: infer V } ? { [Symbol.match]: V } : {}) &
  (T extends { [Symbol.matchAll]: infer V } ? { [Symbol.matchAll]: V } : {}) &
  (T extends { [Symbol.replace]: infer V } ? { [Symbol.replace]: V } : {}) &
  (T extends { [Symbol.search]: infer V } ? { [Symbol.search]: V } : {}) &
  (T extends { [Symbol.species]: infer V } ? { [Symbol.species]: V } : {}) &
  (T extends { [Symbol.split]: infer V } ? { [Symbol.split]: V } : {}) &
  (T extends { [Symbol.toPrimitive]: infer V }
    ? { [Symbol.toPrimitive]: V }
    : {}) &
  (T extends { [Symbol.toStringTag]: infer V }
    ? { [Symbol.toStringTag]: V }
    : {}) &
  (T extends { [Symbol.unscopables]: infer V }
    ? { [Symbol.unscopables]: V }
    : {})

type UnwrappedObject<T> = { [P in keyof T]: UnwrapRef<T[P]> } & SymbolExtract<T>
