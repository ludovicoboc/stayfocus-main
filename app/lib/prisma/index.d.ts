
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Usuario
 * 
 */
export type Usuario = $Result.DefaultSelection<Prisma.$UsuarioPayload>
/**
 * Model Refeicao
 * 
 */
export type Refeicao = $Result.DefaultSelection<Prisma.$RefeicaoPayload>
/**
 * Model RegistroRefeicao
 * 
 */
export type RegistroRefeicao = $Result.DefaultSelection<Prisma.$RegistroRefeicaoPayload>
/**
 * Model RegistroHidratacao
 * 
 */
export type RegistroHidratacao = $Result.DefaultSelection<Prisma.$RegistroHidratacaoPayload>
/**
 * Model RegistroSono
 * 
 */
export type RegistroSono = $Result.DefaultSelection<Prisma.$RegistroSonoPayload>
/**
 * Model LembreteSono
 * 
 */
export type LembreteSono = $Result.DefaultSelection<Prisma.$LembreteSonoPayload>
/**
 * Model Receita
 * 
 */
export type Receita = $Result.DefaultSelection<Prisma.$ReceitaPayload>
/**
 * Model Ingrediente
 * 
 */
export type Ingrediente = $Result.DefaultSelection<Prisma.$IngredientePayload>
/**
 * Model PassoReceita
 * 
 */
export type PassoReceita = $Result.DefaultSelection<Prisma.$PassoReceitaPayload>
/**
 * Model ReceitaFavorita
 * 
 */
export type ReceitaFavorita = $Result.DefaultSelection<Prisma.$ReceitaFavoritaPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Usuarios
 * const usuarios = await prisma.usuario.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Usuarios
   * const usuarios = await prisma.usuario.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.usuario`: Exposes CRUD operations for the **Usuario** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Usuarios
    * const usuarios = await prisma.usuario.findMany()
    * ```
    */
  get usuario(): Prisma.UsuarioDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.refeicao`: Exposes CRUD operations for the **Refeicao** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Refeicaos
    * const refeicaos = await prisma.refeicao.findMany()
    * ```
    */
  get refeicao(): Prisma.RefeicaoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.registroRefeicao`: Exposes CRUD operations for the **RegistroRefeicao** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RegistroRefeicaos
    * const registroRefeicaos = await prisma.registroRefeicao.findMany()
    * ```
    */
  get registroRefeicao(): Prisma.RegistroRefeicaoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.registroHidratacao`: Exposes CRUD operations for the **RegistroHidratacao** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RegistroHidratacaos
    * const registroHidratacaos = await prisma.registroHidratacao.findMany()
    * ```
    */
  get registroHidratacao(): Prisma.RegistroHidratacaoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.registroSono`: Exposes CRUD operations for the **RegistroSono** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RegistroSonos
    * const registroSonos = await prisma.registroSono.findMany()
    * ```
    */
  get registroSono(): Prisma.RegistroSonoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.lembreteSono`: Exposes CRUD operations for the **LembreteSono** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LembreteSonos
    * const lembreteSonos = await prisma.lembreteSono.findMany()
    * ```
    */
  get lembreteSono(): Prisma.LembreteSonoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.receita`: Exposes CRUD operations for the **Receita** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Receitas
    * const receitas = await prisma.receita.findMany()
    * ```
    */
  get receita(): Prisma.ReceitaDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ingrediente`: Exposes CRUD operations for the **Ingrediente** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ingredientes
    * const ingredientes = await prisma.ingrediente.findMany()
    * ```
    */
  get ingrediente(): Prisma.IngredienteDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.passoReceita`: Exposes CRUD operations for the **PassoReceita** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PassoReceitas
    * const passoReceitas = await prisma.passoReceita.findMany()
    * ```
    */
  get passoReceita(): Prisma.PassoReceitaDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.receitaFavorita`: Exposes CRUD operations for the **ReceitaFavorita** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReceitaFavoritas
    * const receitaFavoritas = await prisma.receitaFavorita.findMany()
    * ```
    */
  get receitaFavorita(): Prisma.ReceitaFavoritaDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.6.0
   * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Usuario: 'Usuario',
    Refeicao: 'Refeicao',
    RegistroRefeicao: 'RegistroRefeicao',
    RegistroHidratacao: 'RegistroHidratacao',
    RegistroSono: 'RegistroSono',
    LembreteSono: 'LembreteSono',
    Receita: 'Receita',
    Ingrediente: 'Ingrediente',
    PassoReceita: 'PassoReceita',
    ReceitaFavorita: 'ReceitaFavorita'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "usuario" | "refeicao" | "registroRefeicao" | "registroHidratacao" | "registroSono" | "lembreteSono" | "receita" | "ingrediente" | "passoReceita" | "receitaFavorita"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Usuario: {
        payload: Prisma.$UsuarioPayload<ExtArgs>
        fields: Prisma.UsuarioFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UsuarioFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UsuarioFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          findFirst: {
            args: Prisma.UsuarioFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UsuarioFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          findMany: {
            args: Prisma.UsuarioFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>[]
          }
          create: {
            args: Prisma.UsuarioCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          createMany: {
            args: Prisma.UsuarioCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UsuarioCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>[]
          }
          delete: {
            args: Prisma.UsuarioDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          update: {
            args: Prisma.UsuarioUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          deleteMany: {
            args: Prisma.UsuarioDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UsuarioUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UsuarioUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>[]
          }
          upsert: {
            args: Prisma.UsuarioUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          aggregate: {
            args: Prisma.UsuarioAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsuario>
          }
          groupBy: {
            args: Prisma.UsuarioGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsuarioGroupByOutputType>[]
          }
          count: {
            args: Prisma.UsuarioCountArgs<ExtArgs>
            result: $Utils.Optional<UsuarioCountAggregateOutputType> | number
          }
        }
      }
      Refeicao: {
        payload: Prisma.$RefeicaoPayload<ExtArgs>
        fields: Prisma.RefeicaoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RefeicaoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefeicaoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RefeicaoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefeicaoPayload>
          }
          findFirst: {
            args: Prisma.RefeicaoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefeicaoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RefeicaoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefeicaoPayload>
          }
          findMany: {
            args: Prisma.RefeicaoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefeicaoPayload>[]
          }
          create: {
            args: Prisma.RefeicaoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefeicaoPayload>
          }
          createMany: {
            args: Prisma.RefeicaoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RefeicaoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefeicaoPayload>[]
          }
          delete: {
            args: Prisma.RefeicaoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefeicaoPayload>
          }
          update: {
            args: Prisma.RefeicaoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefeicaoPayload>
          }
          deleteMany: {
            args: Prisma.RefeicaoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RefeicaoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RefeicaoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefeicaoPayload>[]
          }
          upsert: {
            args: Prisma.RefeicaoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefeicaoPayload>
          }
          aggregate: {
            args: Prisma.RefeicaoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRefeicao>
          }
          groupBy: {
            args: Prisma.RefeicaoGroupByArgs<ExtArgs>
            result: $Utils.Optional<RefeicaoGroupByOutputType>[]
          }
          count: {
            args: Prisma.RefeicaoCountArgs<ExtArgs>
            result: $Utils.Optional<RefeicaoCountAggregateOutputType> | number
          }
        }
      }
      RegistroRefeicao: {
        payload: Prisma.$RegistroRefeicaoPayload<ExtArgs>
        fields: Prisma.RegistroRefeicaoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RegistroRefeicaoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroRefeicaoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RegistroRefeicaoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroRefeicaoPayload>
          }
          findFirst: {
            args: Prisma.RegistroRefeicaoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroRefeicaoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RegistroRefeicaoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroRefeicaoPayload>
          }
          findMany: {
            args: Prisma.RegistroRefeicaoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroRefeicaoPayload>[]
          }
          create: {
            args: Prisma.RegistroRefeicaoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroRefeicaoPayload>
          }
          createMany: {
            args: Prisma.RegistroRefeicaoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RegistroRefeicaoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroRefeicaoPayload>[]
          }
          delete: {
            args: Prisma.RegistroRefeicaoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroRefeicaoPayload>
          }
          update: {
            args: Prisma.RegistroRefeicaoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroRefeicaoPayload>
          }
          deleteMany: {
            args: Prisma.RegistroRefeicaoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RegistroRefeicaoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RegistroRefeicaoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroRefeicaoPayload>[]
          }
          upsert: {
            args: Prisma.RegistroRefeicaoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroRefeicaoPayload>
          }
          aggregate: {
            args: Prisma.RegistroRefeicaoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRegistroRefeicao>
          }
          groupBy: {
            args: Prisma.RegistroRefeicaoGroupByArgs<ExtArgs>
            result: $Utils.Optional<RegistroRefeicaoGroupByOutputType>[]
          }
          count: {
            args: Prisma.RegistroRefeicaoCountArgs<ExtArgs>
            result: $Utils.Optional<RegistroRefeicaoCountAggregateOutputType> | number
          }
        }
      }
      RegistroHidratacao: {
        payload: Prisma.$RegistroHidratacaoPayload<ExtArgs>
        fields: Prisma.RegistroHidratacaoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RegistroHidratacaoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroHidratacaoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RegistroHidratacaoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroHidratacaoPayload>
          }
          findFirst: {
            args: Prisma.RegistroHidratacaoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroHidratacaoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RegistroHidratacaoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroHidratacaoPayload>
          }
          findMany: {
            args: Prisma.RegistroHidratacaoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroHidratacaoPayload>[]
          }
          create: {
            args: Prisma.RegistroHidratacaoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroHidratacaoPayload>
          }
          createMany: {
            args: Prisma.RegistroHidratacaoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RegistroHidratacaoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroHidratacaoPayload>[]
          }
          delete: {
            args: Prisma.RegistroHidratacaoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroHidratacaoPayload>
          }
          update: {
            args: Prisma.RegistroHidratacaoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroHidratacaoPayload>
          }
          deleteMany: {
            args: Prisma.RegistroHidratacaoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RegistroHidratacaoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RegistroHidratacaoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroHidratacaoPayload>[]
          }
          upsert: {
            args: Prisma.RegistroHidratacaoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroHidratacaoPayload>
          }
          aggregate: {
            args: Prisma.RegistroHidratacaoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRegistroHidratacao>
          }
          groupBy: {
            args: Prisma.RegistroHidratacaoGroupByArgs<ExtArgs>
            result: $Utils.Optional<RegistroHidratacaoGroupByOutputType>[]
          }
          count: {
            args: Prisma.RegistroHidratacaoCountArgs<ExtArgs>
            result: $Utils.Optional<RegistroHidratacaoCountAggregateOutputType> | number
          }
        }
      }
      RegistroSono: {
        payload: Prisma.$RegistroSonoPayload<ExtArgs>
        fields: Prisma.RegistroSonoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RegistroSonoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroSonoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RegistroSonoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroSonoPayload>
          }
          findFirst: {
            args: Prisma.RegistroSonoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroSonoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RegistroSonoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroSonoPayload>
          }
          findMany: {
            args: Prisma.RegistroSonoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroSonoPayload>[]
          }
          create: {
            args: Prisma.RegistroSonoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroSonoPayload>
          }
          createMany: {
            args: Prisma.RegistroSonoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RegistroSonoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroSonoPayload>[]
          }
          delete: {
            args: Prisma.RegistroSonoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroSonoPayload>
          }
          update: {
            args: Prisma.RegistroSonoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroSonoPayload>
          }
          deleteMany: {
            args: Prisma.RegistroSonoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RegistroSonoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RegistroSonoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroSonoPayload>[]
          }
          upsert: {
            args: Prisma.RegistroSonoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroSonoPayload>
          }
          aggregate: {
            args: Prisma.RegistroSonoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRegistroSono>
          }
          groupBy: {
            args: Prisma.RegistroSonoGroupByArgs<ExtArgs>
            result: $Utils.Optional<RegistroSonoGroupByOutputType>[]
          }
          count: {
            args: Prisma.RegistroSonoCountArgs<ExtArgs>
            result: $Utils.Optional<RegistroSonoCountAggregateOutputType> | number
          }
        }
      }
      LembreteSono: {
        payload: Prisma.$LembreteSonoPayload<ExtArgs>
        fields: Prisma.LembreteSonoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LembreteSonoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LembreteSonoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LembreteSonoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LembreteSonoPayload>
          }
          findFirst: {
            args: Prisma.LembreteSonoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LembreteSonoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LembreteSonoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LembreteSonoPayload>
          }
          findMany: {
            args: Prisma.LembreteSonoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LembreteSonoPayload>[]
          }
          create: {
            args: Prisma.LembreteSonoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LembreteSonoPayload>
          }
          createMany: {
            args: Prisma.LembreteSonoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LembreteSonoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LembreteSonoPayload>[]
          }
          delete: {
            args: Prisma.LembreteSonoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LembreteSonoPayload>
          }
          update: {
            args: Prisma.LembreteSonoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LembreteSonoPayload>
          }
          deleteMany: {
            args: Prisma.LembreteSonoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LembreteSonoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LembreteSonoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LembreteSonoPayload>[]
          }
          upsert: {
            args: Prisma.LembreteSonoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LembreteSonoPayload>
          }
          aggregate: {
            args: Prisma.LembreteSonoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLembreteSono>
          }
          groupBy: {
            args: Prisma.LembreteSonoGroupByArgs<ExtArgs>
            result: $Utils.Optional<LembreteSonoGroupByOutputType>[]
          }
          count: {
            args: Prisma.LembreteSonoCountArgs<ExtArgs>
            result: $Utils.Optional<LembreteSonoCountAggregateOutputType> | number
          }
        }
      }
      Receita: {
        payload: Prisma.$ReceitaPayload<ExtArgs>
        fields: Prisma.ReceitaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReceitaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReceitaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaPayload>
          }
          findFirst: {
            args: Prisma.ReceitaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReceitaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaPayload>
          }
          findMany: {
            args: Prisma.ReceitaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaPayload>[]
          }
          create: {
            args: Prisma.ReceitaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaPayload>
          }
          createMany: {
            args: Prisma.ReceitaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReceitaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaPayload>[]
          }
          delete: {
            args: Prisma.ReceitaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaPayload>
          }
          update: {
            args: Prisma.ReceitaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaPayload>
          }
          deleteMany: {
            args: Prisma.ReceitaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReceitaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReceitaUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaPayload>[]
          }
          upsert: {
            args: Prisma.ReceitaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaPayload>
          }
          aggregate: {
            args: Prisma.ReceitaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReceita>
          }
          groupBy: {
            args: Prisma.ReceitaGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReceitaGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReceitaCountArgs<ExtArgs>
            result: $Utils.Optional<ReceitaCountAggregateOutputType> | number
          }
        }
      }
      Ingrediente: {
        payload: Prisma.$IngredientePayload<ExtArgs>
        fields: Prisma.IngredienteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IngredienteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IngredienteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientePayload>
          }
          findFirst: {
            args: Prisma.IngredienteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IngredienteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientePayload>
          }
          findMany: {
            args: Prisma.IngredienteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientePayload>[]
          }
          create: {
            args: Prisma.IngredienteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientePayload>
          }
          createMany: {
            args: Prisma.IngredienteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IngredienteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientePayload>[]
          }
          delete: {
            args: Prisma.IngredienteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientePayload>
          }
          update: {
            args: Prisma.IngredienteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientePayload>
          }
          deleteMany: {
            args: Prisma.IngredienteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IngredienteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.IngredienteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientePayload>[]
          }
          upsert: {
            args: Prisma.IngredienteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientePayload>
          }
          aggregate: {
            args: Prisma.IngredienteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIngrediente>
          }
          groupBy: {
            args: Prisma.IngredienteGroupByArgs<ExtArgs>
            result: $Utils.Optional<IngredienteGroupByOutputType>[]
          }
          count: {
            args: Prisma.IngredienteCountArgs<ExtArgs>
            result: $Utils.Optional<IngredienteCountAggregateOutputType> | number
          }
        }
      }
      PassoReceita: {
        payload: Prisma.$PassoReceitaPayload<ExtArgs>
        fields: Prisma.PassoReceitaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PassoReceitaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassoReceitaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PassoReceitaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassoReceitaPayload>
          }
          findFirst: {
            args: Prisma.PassoReceitaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassoReceitaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PassoReceitaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassoReceitaPayload>
          }
          findMany: {
            args: Prisma.PassoReceitaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassoReceitaPayload>[]
          }
          create: {
            args: Prisma.PassoReceitaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassoReceitaPayload>
          }
          createMany: {
            args: Prisma.PassoReceitaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PassoReceitaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassoReceitaPayload>[]
          }
          delete: {
            args: Prisma.PassoReceitaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassoReceitaPayload>
          }
          update: {
            args: Prisma.PassoReceitaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassoReceitaPayload>
          }
          deleteMany: {
            args: Prisma.PassoReceitaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PassoReceitaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PassoReceitaUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassoReceitaPayload>[]
          }
          upsert: {
            args: Prisma.PassoReceitaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassoReceitaPayload>
          }
          aggregate: {
            args: Prisma.PassoReceitaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePassoReceita>
          }
          groupBy: {
            args: Prisma.PassoReceitaGroupByArgs<ExtArgs>
            result: $Utils.Optional<PassoReceitaGroupByOutputType>[]
          }
          count: {
            args: Prisma.PassoReceitaCountArgs<ExtArgs>
            result: $Utils.Optional<PassoReceitaCountAggregateOutputType> | number
          }
        }
      }
      ReceitaFavorita: {
        payload: Prisma.$ReceitaFavoritaPayload<ExtArgs>
        fields: Prisma.ReceitaFavoritaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReceitaFavoritaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaFavoritaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReceitaFavoritaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaFavoritaPayload>
          }
          findFirst: {
            args: Prisma.ReceitaFavoritaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaFavoritaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReceitaFavoritaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaFavoritaPayload>
          }
          findMany: {
            args: Prisma.ReceitaFavoritaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaFavoritaPayload>[]
          }
          create: {
            args: Prisma.ReceitaFavoritaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaFavoritaPayload>
          }
          createMany: {
            args: Prisma.ReceitaFavoritaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReceitaFavoritaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaFavoritaPayload>[]
          }
          delete: {
            args: Prisma.ReceitaFavoritaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaFavoritaPayload>
          }
          update: {
            args: Prisma.ReceitaFavoritaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaFavoritaPayload>
          }
          deleteMany: {
            args: Prisma.ReceitaFavoritaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReceitaFavoritaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReceitaFavoritaUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaFavoritaPayload>[]
          }
          upsert: {
            args: Prisma.ReceitaFavoritaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceitaFavoritaPayload>
          }
          aggregate: {
            args: Prisma.ReceitaFavoritaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReceitaFavorita>
          }
          groupBy: {
            args: Prisma.ReceitaFavoritaGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReceitaFavoritaGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReceitaFavoritaCountArgs<ExtArgs>
            result: $Utils.Optional<ReceitaFavoritaCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    usuario?: UsuarioOmit
    refeicao?: RefeicaoOmit
    registroRefeicao?: RegistroRefeicaoOmit
    registroHidratacao?: RegistroHidratacaoOmit
    registroSono?: RegistroSonoOmit
    lembreteSono?: LembreteSonoOmit
    receita?: ReceitaOmit
    ingrediente?: IngredienteOmit
    passoReceita?: PassoReceitaOmit
    receitaFavorita?: ReceitaFavoritaOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UsuarioCountOutputType
   */

  export type UsuarioCountOutputType = {
    lembretesSono: number
    receitas: number
    receitasFavoritas: number
    refeicoes: number
    registrosRefeicao: number
    registrosSono: number
  }

  export type UsuarioCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lembretesSono?: boolean | UsuarioCountOutputTypeCountLembretesSonoArgs
    receitas?: boolean | UsuarioCountOutputTypeCountReceitasArgs
    receitasFavoritas?: boolean | UsuarioCountOutputTypeCountReceitasFavoritasArgs
    refeicoes?: boolean | UsuarioCountOutputTypeCountRefeicoesArgs
    registrosRefeicao?: boolean | UsuarioCountOutputTypeCountRegistrosRefeicaoArgs
    registrosSono?: boolean | UsuarioCountOutputTypeCountRegistrosSonoArgs
  }

  // Custom InputTypes
  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioCountOutputType
     */
    select?: UsuarioCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountLembretesSonoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LembreteSonoWhereInput
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountReceitasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReceitaWhereInput
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountReceitasFavoritasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReceitaFavoritaWhereInput
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountRefeicoesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RefeicaoWhereInput
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountRegistrosRefeicaoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RegistroRefeicaoWhereInput
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountRegistrosSonoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RegistroSonoWhereInput
  }


  /**
   * Count Type ReceitaCountOutputType
   */

  export type ReceitaCountOutputType = {
    ingredientes: number
    passos: number
    favoritos: number
  }

  export type ReceitaCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ingredientes?: boolean | ReceitaCountOutputTypeCountIngredientesArgs
    passos?: boolean | ReceitaCountOutputTypeCountPassosArgs
    favoritos?: boolean | ReceitaCountOutputTypeCountFavoritosArgs
  }

  // Custom InputTypes
  /**
   * ReceitaCountOutputType without action
   */
  export type ReceitaCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceitaCountOutputType
     */
    select?: ReceitaCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ReceitaCountOutputType without action
   */
  export type ReceitaCountOutputTypeCountIngredientesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IngredienteWhereInput
  }

  /**
   * ReceitaCountOutputType without action
   */
  export type ReceitaCountOutputTypeCountPassosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PassoReceitaWhereInput
  }

  /**
   * ReceitaCountOutputType without action
   */
  export type ReceitaCountOutputTypeCountFavoritosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReceitaFavoritaWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Usuario
   */

  export type AggregateUsuario = {
    _count: UsuarioCountAggregateOutputType | null
    _avg: UsuarioAvgAggregateOutputType | null
    _sum: UsuarioSumAggregateOutputType | null
    _min: UsuarioMinAggregateOutputType | null
    _max: UsuarioMaxAggregateOutputType | null
  }

  export type UsuarioAvgAggregateOutputType = {
    metaHorasSono: number | null
    metaTarefasPrioritarias: number | null
    metaCoposAgua: number | null
    metaPausasProgramadas: number | null
  }

  export type UsuarioSumAggregateOutputType = {
    metaHorasSono: number | null
    metaTarefasPrioritarias: number | null
    metaCoposAgua: number | null
    metaPausasProgramadas: number | null
  }

  export type UsuarioMinAggregateOutputType = {
    id: string | null
    email: string | null
    nome: string | null
    createdAt: Date | null
    updatedAt: Date | null
    altoContraste: boolean | null
    reducaoEstimulos: boolean | null
    textoGrande: boolean | null
    metaHorasSono: number | null
    metaTarefasPrioritarias: number | null
    metaCoposAgua: number | null
    metaPausasProgramadas: number | null
    notificacoesAtivas: boolean | null
    pausasAtivas: boolean | null
  }

  export type UsuarioMaxAggregateOutputType = {
    id: string | null
    email: string | null
    nome: string | null
    createdAt: Date | null
    updatedAt: Date | null
    altoContraste: boolean | null
    reducaoEstimulos: boolean | null
    textoGrande: boolean | null
    metaHorasSono: number | null
    metaTarefasPrioritarias: number | null
    metaCoposAgua: number | null
    metaPausasProgramadas: number | null
    notificacoesAtivas: boolean | null
    pausasAtivas: boolean | null
  }

  export type UsuarioCountAggregateOutputType = {
    id: number
    email: number
    nome: number
    createdAt: number
    updatedAt: number
    altoContraste: number
    reducaoEstimulos: number
    textoGrande: number
    metaHorasSono: number
    metaTarefasPrioritarias: number
    metaCoposAgua: number
    metaPausasProgramadas: number
    notificacoesAtivas: number
    pausasAtivas: number
    _all: number
  }


  export type UsuarioAvgAggregateInputType = {
    metaHorasSono?: true
    metaTarefasPrioritarias?: true
    metaCoposAgua?: true
    metaPausasProgramadas?: true
  }

  export type UsuarioSumAggregateInputType = {
    metaHorasSono?: true
    metaTarefasPrioritarias?: true
    metaCoposAgua?: true
    metaPausasProgramadas?: true
  }

  export type UsuarioMinAggregateInputType = {
    id?: true
    email?: true
    nome?: true
    createdAt?: true
    updatedAt?: true
    altoContraste?: true
    reducaoEstimulos?: true
    textoGrande?: true
    metaHorasSono?: true
    metaTarefasPrioritarias?: true
    metaCoposAgua?: true
    metaPausasProgramadas?: true
    notificacoesAtivas?: true
    pausasAtivas?: true
  }

  export type UsuarioMaxAggregateInputType = {
    id?: true
    email?: true
    nome?: true
    createdAt?: true
    updatedAt?: true
    altoContraste?: true
    reducaoEstimulos?: true
    textoGrande?: true
    metaHorasSono?: true
    metaTarefasPrioritarias?: true
    metaCoposAgua?: true
    metaPausasProgramadas?: true
    notificacoesAtivas?: true
    pausasAtivas?: true
  }

  export type UsuarioCountAggregateInputType = {
    id?: true
    email?: true
    nome?: true
    createdAt?: true
    updatedAt?: true
    altoContraste?: true
    reducaoEstimulos?: true
    textoGrande?: true
    metaHorasSono?: true
    metaTarefasPrioritarias?: true
    metaCoposAgua?: true
    metaPausasProgramadas?: true
    notificacoesAtivas?: true
    pausasAtivas?: true
    _all?: true
  }

  export type UsuarioAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Usuario to aggregate.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Usuarios
    **/
    _count?: true | UsuarioCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UsuarioAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UsuarioSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsuarioMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsuarioMaxAggregateInputType
  }

  export type GetUsuarioAggregateType<T extends UsuarioAggregateArgs> = {
        [P in keyof T & keyof AggregateUsuario]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsuario[P]>
      : GetScalarType<T[P], AggregateUsuario[P]>
  }




  export type UsuarioGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsuarioWhereInput
    orderBy?: UsuarioOrderByWithAggregationInput | UsuarioOrderByWithAggregationInput[]
    by: UsuarioScalarFieldEnum[] | UsuarioScalarFieldEnum
    having?: UsuarioScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsuarioCountAggregateInputType | true
    _avg?: UsuarioAvgAggregateInputType
    _sum?: UsuarioSumAggregateInputType
    _min?: UsuarioMinAggregateInputType
    _max?: UsuarioMaxAggregateInputType
  }

  export type UsuarioGroupByOutputType = {
    id: string
    email: string
    nome: string
    createdAt: Date
    updatedAt: Date
    altoContraste: boolean
    reducaoEstimulos: boolean
    textoGrande: boolean
    metaHorasSono: number
    metaTarefasPrioritarias: number
    metaCoposAgua: number
    metaPausasProgramadas: number
    notificacoesAtivas: boolean
    pausasAtivas: boolean
    _count: UsuarioCountAggregateOutputType | null
    _avg: UsuarioAvgAggregateOutputType | null
    _sum: UsuarioSumAggregateOutputType | null
    _min: UsuarioMinAggregateOutputType | null
    _max: UsuarioMaxAggregateOutputType | null
  }

  type GetUsuarioGroupByPayload<T extends UsuarioGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsuarioGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsuarioGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsuarioGroupByOutputType[P]>
            : GetScalarType<T[P], UsuarioGroupByOutputType[P]>
        }
      >
    >


  export type UsuarioSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    nome?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: boolean
    metaTarefasPrioritarias?: boolean
    metaCoposAgua?: boolean
    metaPausasProgramadas?: boolean
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
    lembretesSono?: boolean | Usuario$lembretesSonoArgs<ExtArgs>
    receitas?: boolean | Usuario$receitasArgs<ExtArgs>
    receitasFavoritas?: boolean | Usuario$receitasFavoritasArgs<ExtArgs>
    refeicoes?: boolean | Usuario$refeicoesArgs<ExtArgs>
    registrosRefeicao?: boolean | Usuario$registrosRefeicaoArgs<ExtArgs>
    registrosSono?: boolean | Usuario$registrosSonoArgs<ExtArgs>
    _count?: boolean | UsuarioCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["usuario"]>

  export type UsuarioSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    nome?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: boolean
    metaTarefasPrioritarias?: boolean
    metaCoposAgua?: boolean
    metaPausasProgramadas?: boolean
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
  }, ExtArgs["result"]["usuario"]>

  export type UsuarioSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    nome?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: boolean
    metaTarefasPrioritarias?: boolean
    metaCoposAgua?: boolean
    metaPausasProgramadas?: boolean
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
  }, ExtArgs["result"]["usuario"]>

  export type UsuarioSelectScalar = {
    id?: boolean
    email?: boolean
    nome?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: boolean
    metaTarefasPrioritarias?: boolean
    metaCoposAgua?: boolean
    metaPausasProgramadas?: boolean
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
  }

  export type UsuarioOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "nome" | "createdAt" | "updatedAt" | "altoContraste" | "reducaoEstimulos" | "textoGrande" | "metaHorasSono" | "metaTarefasPrioritarias" | "metaCoposAgua" | "metaPausasProgramadas" | "notificacoesAtivas" | "pausasAtivas", ExtArgs["result"]["usuario"]>
  export type UsuarioInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lembretesSono?: boolean | Usuario$lembretesSonoArgs<ExtArgs>
    receitas?: boolean | Usuario$receitasArgs<ExtArgs>
    receitasFavoritas?: boolean | Usuario$receitasFavoritasArgs<ExtArgs>
    refeicoes?: boolean | Usuario$refeicoesArgs<ExtArgs>
    registrosRefeicao?: boolean | Usuario$registrosRefeicaoArgs<ExtArgs>
    registrosSono?: boolean | Usuario$registrosSonoArgs<ExtArgs>
    _count?: boolean | UsuarioCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UsuarioIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UsuarioIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UsuarioPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Usuario"
    objects: {
      lembretesSono: Prisma.$LembreteSonoPayload<ExtArgs>[]
      receitas: Prisma.$ReceitaPayload<ExtArgs>[]
      receitasFavoritas: Prisma.$ReceitaFavoritaPayload<ExtArgs>[]
      refeicoes: Prisma.$RefeicaoPayload<ExtArgs>[]
      registrosRefeicao: Prisma.$RegistroRefeicaoPayload<ExtArgs>[]
      registrosSono: Prisma.$RegistroSonoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      nome: string
      createdAt: Date
      updatedAt: Date
      altoContraste: boolean
      reducaoEstimulos: boolean
      textoGrande: boolean
      metaHorasSono: number
      metaTarefasPrioritarias: number
      metaCoposAgua: number
      metaPausasProgramadas: number
      notificacoesAtivas: boolean
      pausasAtivas: boolean
    }, ExtArgs["result"]["usuario"]>
    composites: {}
  }

  type UsuarioGetPayload<S extends boolean | null | undefined | UsuarioDefaultArgs> = $Result.GetResult<Prisma.$UsuarioPayload, S>

  type UsuarioCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UsuarioFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UsuarioCountAggregateInputType | true
    }

  export interface UsuarioDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Usuario'], meta: { name: 'Usuario' } }
    /**
     * Find zero or one Usuario that matches the filter.
     * @param {UsuarioFindUniqueArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UsuarioFindUniqueArgs>(args: SelectSubset<T, UsuarioFindUniqueArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Usuario that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UsuarioFindUniqueOrThrowArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UsuarioFindUniqueOrThrowArgs>(args: SelectSubset<T, UsuarioFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Usuario that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioFindFirstArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UsuarioFindFirstArgs>(args?: SelectSubset<T, UsuarioFindFirstArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Usuario that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioFindFirstOrThrowArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UsuarioFindFirstOrThrowArgs>(args?: SelectSubset<T, UsuarioFindFirstOrThrowArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Usuarios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Usuarios
     * const usuarios = await prisma.usuario.findMany()
     * 
     * // Get first 10 Usuarios
     * const usuarios = await prisma.usuario.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const usuarioWithIdOnly = await prisma.usuario.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UsuarioFindManyArgs>(args?: SelectSubset<T, UsuarioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Usuario.
     * @param {UsuarioCreateArgs} args - Arguments to create a Usuario.
     * @example
     * // Create one Usuario
     * const Usuario = await prisma.usuario.create({
     *   data: {
     *     // ... data to create a Usuario
     *   }
     * })
     * 
     */
    create<T extends UsuarioCreateArgs>(args: SelectSubset<T, UsuarioCreateArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Usuarios.
     * @param {UsuarioCreateManyArgs} args - Arguments to create many Usuarios.
     * @example
     * // Create many Usuarios
     * const usuario = await prisma.usuario.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UsuarioCreateManyArgs>(args?: SelectSubset<T, UsuarioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Usuarios and returns the data saved in the database.
     * @param {UsuarioCreateManyAndReturnArgs} args - Arguments to create many Usuarios.
     * @example
     * // Create many Usuarios
     * const usuario = await prisma.usuario.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Usuarios and only return the `id`
     * const usuarioWithIdOnly = await prisma.usuario.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UsuarioCreateManyAndReturnArgs>(args?: SelectSubset<T, UsuarioCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Usuario.
     * @param {UsuarioDeleteArgs} args - Arguments to delete one Usuario.
     * @example
     * // Delete one Usuario
     * const Usuario = await prisma.usuario.delete({
     *   where: {
     *     // ... filter to delete one Usuario
     *   }
     * })
     * 
     */
    delete<T extends UsuarioDeleteArgs>(args: SelectSubset<T, UsuarioDeleteArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Usuario.
     * @param {UsuarioUpdateArgs} args - Arguments to update one Usuario.
     * @example
     * // Update one Usuario
     * const usuario = await prisma.usuario.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UsuarioUpdateArgs>(args: SelectSubset<T, UsuarioUpdateArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Usuarios.
     * @param {UsuarioDeleteManyArgs} args - Arguments to filter Usuarios to delete.
     * @example
     * // Delete a few Usuarios
     * const { count } = await prisma.usuario.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UsuarioDeleteManyArgs>(args?: SelectSubset<T, UsuarioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Usuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Usuarios
     * const usuario = await prisma.usuario.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UsuarioUpdateManyArgs>(args: SelectSubset<T, UsuarioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Usuarios and returns the data updated in the database.
     * @param {UsuarioUpdateManyAndReturnArgs} args - Arguments to update many Usuarios.
     * @example
     * // Update many Usuarios
     * const usuario = await prisma.usuario.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Usuarios and only return the `id`
     * const usuarioWithIdOnly = await prisma.usuario.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UsuarioUpdateManyAndReturnArgs>(args: SelectSubset<T, UsuarioUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Usuario.
     * @param {UsuarioUpsertArgs} args - Arguments to update or create a Usuario.
     * @example
     * // Update or create a Usuario
     * const usuario = await prisma.usuario.upsert({
     *   create: {
     *     // ... data to create a Usuario
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Usuario we want to update
     *   }
     * })
     */
    upsert<T extends UsuarioUpsertArgs>(args: SelectSubset<T, UsuarioUpsertArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Usuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioCountArgs} args - Arguments to filter Usuarios to count.
     * @example
     * // Count the number of Usuarios
     * const count = await prisma.usuario.count({
     *   where: {
     *     // ... the filter for the Usuarios we want to count
     *   }
     * })
    **/
    count<T extends UsuarioCountArgs>(
      args?: Subset<T, UsuarioCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsuarioCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Usuario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UsuarioAggregateArgs>(args: Subset<T, UsuarioAggregateArgs>): Prisma.PrismaPromise<GetUsuarioAggregateType<T>>

    /**
     * Group by Usuario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UsuarioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UsuarioGroupByArgs['orderBy'] }
        : { orderBy?: UsuarioGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UsuarioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsuarioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Usuario model
   */
  readonly fields: UsuarioFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Usuario.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UsuarioClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    lembretesSono<T extends Usuario$lembretesSonoArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$lembretesSonoArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LembreteSonoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    receitas<T extends Usuario$receitasArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$receitasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceitaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    receitasFavoritas<T extends Usuario$receitasFavoritasArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$receitasFavoritasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceitaFavoritaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    refeicoes<T extends Usuario$refeicoesArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$refeicoesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RefeicaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    registrosRefeicao<T extends Usuario$registrosRefeicaoArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$registrosRefeicaoArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroRefeicaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    registrosSono<T extends Usuario$registrosSonoArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$registrosSonoArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroSonoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Usuario model
   */
  interface UsuarioFieldRefs {
    readonly id: FieldRef<"Usuario", 'String'>
    readonly email: FieldRef<"Usuario", 'String'>
    readonly nome: FieldRef<"Usuario", 'String'>
    readonly createdAt: FieldRef<"Usuario", 'DateTime'>
    readonly updatedAt: FieldRef<"Usuario", 'DateTime'>
    readonly altoContraste: FieldRef<"Usuario", 'Boolean'>
    readonly reducaoEstimulos: FieldRef<"Usuario", 'Boolean'>
    readonly textoGrande: FieldRef<"Usuario", 'Boolean'>
    readonly metaHorasSono: FieldRef<"Usuario", 'Int'>
    readonly metaTarefasPrioritarias: FieldRef<"Usuario", 'Int'>
    readonly metaCoposAgua: FieldRef<"Usuario", 'Int'>
    readonly metaPausasProgramadas: FieldRef<"Usuario", 'Int'>
    readonly notificacoesAtivas: FieldRef<"Usuario", 'Boolean'>
    readonly pausasAtivas: FieldRef<"Usuario", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Usuario findUnique
   */
  export type UsuarioFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario findUniqueOrThrow
   */
  export type UsuarioFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario findFirst
   */
  export type UsuarioFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Usuarios.
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Usuarios.
     */
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario findFirstOrThrow
   */
  export type UsuarioFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Usuarios.
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Usuarios.
     */
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario findMany
   */
  export type UsuarioFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuarios to fetch.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Usuarios.
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario create
   */
  export type UsuarioCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * The data needed to create a Usuario.
     */
    data: XOR<UsuarioCreateInput, UsuarioUncheckedCreateInput>
  }

  /**
   * Usuario createMany
   */
  export type UsuarioCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Usuarios.
     */
    data: UsuarioCreateManyInput | UsuarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Usuario createManyAndReturn
   */
  export type UsuarioCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * The data used to create many Usuarios.
     */
    data: UsuarioCreateManyInput | UsuarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Usuario update
   */
  export type UsuarioUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * The data needed to update a Usuario.
     */
    data: XOR<UsuarioUpdateInput, UsuarioUncheckedUpdateInput>
    /**
     * Choose, which Usuario to update.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario updateMany
   */
  export type UsuarioUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Usuarios.
     */
    data: XOR<UsuarioUpdateManyMutationInput, UsuarioUncheckedUpdateManyInput>
    /**
     * Filter which Usuarios to update
     */
    where?: UsuarioWhereInput
    /**
     * Limit how many Usuarios to update.
     */
    limit?: number
  }

  /**
   * Usuario updateManyAndReturn
   */
  export type UsuarioUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * The data used to update Usuarios.
     */
    data: XOR<UsuarioUpdateManyMutationInput, UsuarioUncheckedUpdateManyInput>
    /**
     * Filter which Usuarios to update
     */
    where?: UsuarioWhereInput
    /**
     * Limit how many Usuarios to update.
     */
    limit?: number
  }

  /**
   * Usuario upsert
   */
  export type UsuarioUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * The filter to search for the Usuario to update in case it exists.
     */
    where: UsuarioWhereUniqueInput
    /**
     * In case the Usuario found by the `where` argument doesn't exist, create a new Usuario with this data.
     */
    create: XOR<UsuarioCreateInput, UsuarioUncheckedCreateInput>
    /**
     * In case the Usuario was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UsuarioUpdateInput, UsuarioUncheckedUpdateInput>
  }

  /**
   * Usuario delete
   */
  export type UsuarioDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter which Usuario to delete.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario deleteMany
   */
  export type UsuarioDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Usuarios to delete
     */
    where?: UsuarioWhereInput
    /**
     * Limit how many Usuarios to delete.
     */
    limit?: number
  }

  /**
   * Usuario.lembretesSono
   */
  export type Usuario$lembretesSonoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LembreteSono
     */
    select?: LembreteSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LembreteSono
     */
    omit?: LembreteSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LembreteSonoInclude<ExtArgs> | null
    where?: LembreteSonoWhereInput
    orderBy?: LembreteSonoOrderByWithRelationInput | LembreteSonoOrderByWithRelationInput[]
    cursor?: LembreteSonoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LembreteSonoScalarFieldEnum | LembreteSonoScalarFieldEnum[]
  }

  /**
   * Usuario.receitas
   */
  export type Usuario$receitasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receita
     */
    select?: ReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receita
     */
    omit?: ReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaInclude<ExtArgs> | null
    where?: ReceitaWhereInput
    orderBy?: ReceitaOrderByWithRelationInput | ReceitaOrderByWithRelationInput[]
    cursor?: ReceitaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReceitaScalarFieldEnum | ReceitaScalarFieldEnum[]
  }

  /**
   * Usuario.receitasFavoritas
   */
  export type Usuario$receitasFavoritasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceitaFavorita
     */
    select?: ReceitaFavoritaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceitaFavorita
     */
    omit?: ReceitaFavoritaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaFavoritaInclude<ExtArgs> | null
    where?: ReceitaFavoritaWhereInput
    orderBy?: ReceitaFavoritaOrderByWithRelationInput | ReceitaFavoritaOrderByWithRelationInput[]
    cursor?: ReceitaFavoritaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReceitaFavoritaScalarFieldEnum | ReceitaFavoritaScalarFieldEnum[]
  }

  /**
   * Usuario.refeicoes
   */
  export type Usuario$refeicoesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Refeicao
     */
    select?: RefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Refeicao
     */
    omit?: RefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefeicaoInclude<ExtArgs> | null
    where?: RefeicaoWhereInput
    orderBy?: RefeicaoOrderByWithRelationInput | RefeicaoOrderByWithRelationInput[]
    cursor?: RefeicaoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RefeicaoScalarFieldEnum | RefeicaoScalarFieldEnum[]
  }

  /**
   * Usuario.registrosRefeicao
   */
  export type Usuario$registrosRefeicaoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroRefeicao
     */
    select?: RegistroRefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroRefeicao
     */
    omit?: RegistroRefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroRefeicaoInclude<ExtArgs> | null
    where?: RegistroRefeicaoWhereInput
    orderBy?: RegistroRefeicaoOrderByWithRelationInput | RegistroRefeicaoOrderByWithRelationInput[]
    cursor?: RegistroRefeicaoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RegistroRefeicaoScalarFieldEnum | RegistroRefeicaoScalarFieldEnum[]
  }

  /**
   * Usuario.registrosSono
   */
  export type Usuario$registrosSonoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroSono
     */
    select?: RegistroSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroSono
     */
    omit?: RegistroSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroSonoInclude<ExtArgs> | null
    where?: RegistroSonoWhereInput
    orderBy?: RegistroSonoOrderByWithRelationInput | RegistroSonoOrderByWithRelationInput[]
    cursor?: RegistroSonoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RegistroSonoScalarFieldEnum | RegistroSonoScalarFieldEnum[]
  }

  /**
   * Usuario without action
   */
  export type UsuarioDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
  }


  /**
   * Model Refeicao
   */

  export type AggregateRefeicao = {
    _count: RefeicaoCountAggregateOutputType | null
    _min: RefeicaoMinAggregateOutputType | null
    _max: RefeicaoMaxAggregateOutputType | null
  }

  export type RefeicaoMinAggregateOutputType = {
    id: string | null
    horario: string | null
    descricao: string | null
    usuarioId: string | null
  }

  export type RefeicaoMaxAggregateOutputType = {
    id: string | null
    horario: string | null
    descricao: string | null
    usuarioId: string | null
  }

  export type RefeicaoCountAggregateOutputType = {
    id: number
    horario: number
    descricao: number
    usuarioId: number
    _all: number
  }


  export type RefeicaoMinAggregateInputType = {
    id?: true
    horario?: true
    descricao?: true
    usuarioId?: true
  }

  export type RefeicaoMaxAggregateInputType = {
    id?: true
    horario?: true
    descricao?: true
    usuarioId?: true
  }

  export type RefeicaoCountAggregateInputType = {
    id?: true
    horario?: true
    descricao?: true
    usuarioId?: true
    _all?: true
  }

  export type RefeicaoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Refeicao to aggregate.
     */
    where?: RefeicaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Refeicaos to fetch.
     */
    orderBy?: RefeicaoOrderByWithRelationInput | RefeicaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RefeicaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Refeicaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Refeicaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Refeicaos
    **/
    _count?: true | RefeicaoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RefeicaoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RefeicaoMaxAggregateInputType
  }

  export type GetRefeicaoAggregateType<T extends RefeicaoAggregateArgs> = {
        [P in keyof T & keyof AggregateRefeicao]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRefeicao[P]>
      : GetScalarType<T[P], AggregateRefeicao[P]>
  }




  export type RefeicaoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RefeicaoWhereInput
    orderBy?: RefeicaoOrderByWithAggregationInput | RefeicaoOrderByWithAggregationInput[]
    by: RefeicaoScalarFieldEnum[] | RefeicaoScalarFieldEnum
    having?: RefeicaoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RefeicaoCountAggregateInputType | true
    _min?: RefeicaoMinAggregateInputType
    _max?: RefeicaoMaxAggregateInputType
  }

  export type RefeicaoGroupByOutputType = {
    id: string
    horario: string
    descricao: string
    usuarioId: string
    _count: RefeicaoCountAggregateOutputType | null
    _min: RefeicaoMinAggregateOutputType | null
    _max: RefeicaoMaxAggregateOutputType | null
  }

  type GetRefeicaoGroupByPayload<T extends RefeicaoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RefeicaoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RefeicaoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RefeicaoGroupByOutputType[P]>
            : GetScalarType<T[P], RefeicaoGroupByOutputType[P]>
        }
      >
    >


  export type RefeicaoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    horario?: boolean
    descricao?: boolean
    usuarioId?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["refeicao"]>

  export type RefeicaoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    horario?: boolean
    descricao?: boolean
    usuarioId?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["refeicao"]>

  export type RefeicaoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    horario?: boolean
    descricao?: boolean
    usuarioId?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["refeicao"]>

  export type RefeicaoSelectScalar = {
    id?: boolean
    horario?: boolean
    descricao?: boolean
    usuarioId?: boolean
  }

  export type RefeicaoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "horario" | "descricao" | "usuarioId", ExtArgs["result"]["refeicao"]>
  export type RefeicaoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }
  export type RefeicaoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }
  export type RefeicaoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }

  export type $RefeicaoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Refeicao"
    objects: {
      usuario: Prisma.$UsuarioPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      horario: string
      descricao: string
      usuarioId: string
    }, ExtArgs["result"]["refeicao"]>
    composites: {}
  }

  type RefeicaoGetPayload<S extends boolean | null | undefined | RefeicaoDefaultArgs> = $Result.GetResult<Prisma.$RefeicaoPayload, S>

  type RefeicaoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RefeicaoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RefeicaoCountAggregateInputType | true
    }

  export interface RefeicaoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Refeicao'], meta: { name: 'Refeicao' } }
    /**
     * Find zero or one Refeicao that matches the filter.
     * @param {RefeicaoFindUniqueArgs} args - Arguments to find a Refeicao
     * @example
     * // Get one Refeicao
     * const refeicao = await prisma.refeicao.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RefeicaoFindUniqueArgs>(args: SelectSubset<T, RefeicaoFindUniqueArgs<ExtArgs>>): Prisma__RefeicaoClient<$Result.GetResult<Prisma.$RefeicaoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Refeicao that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RefeicaoFindUniqueOrThrowArgs} args - Arguments to find a Refeicao
     * @example
     * // Get one Refeicao
     * const refeicao = await prisma.refeicao.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RefeicaoFindUniqueOrThrowArgs>(args: SelectSubset<T, RefeicaoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RefeicaoClient<$Result.GetResult<Prisma.$RefeicaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Refeicao that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefeicaoFindFirstArgs} args - Arguments to find a Refeicao
     * @example
     * // Get one Refeicao
     * const refeicao = await prisma.refeicao.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RefeicaoFindFirstArgs>(args?: SelectSubset<T, RefeicaoFindFirstArgs<ExtArgs>>): Prisma__RefeicaoClient<$Result.GetResult<Prisma.$RefeicaoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Refeicao that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefeicaoFindFirstOrThrowArgs} args - Arguments to find a Refeicao
     * @example
     * // Get one Refeicao
     * const refeicao = await prisma.refeicao.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RefeicaoFindFirstOrThrowArgs>(args?: SelectSubset<T, RefeicaoFindFirstOrThrowArgs<ExtArgs>>): Prisma__RefeicaoClient<$Result.GetResult<Prisma.$RefeicaoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Refeicaos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefeicaoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Refeicaos
     * const refeicaos = await prisma.refeicao.findMany()
     * 
     * // Get first 10 Refeicaos
     * const refeicaos = await prisma.refeicao.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const refeicaoWithIdOnly = await prisma.refeicao.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RefeicaoFindManyArgs>(args?: SelectSubset<T, RefeicaoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RefeicaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Refeicao.
     * @param {RefeicaoCreateArgs} args - Arguments to create a Refeicao.
     * @example
     * // Create one Refeicao
     * const Refeicao = await prisma.refeicao.create({
     *   data: {
     *     // ... data to create a Refeicao
     *   }
     * })
     * 
     */
    create<T extends RefeicaoCreateArgs>(args: SelectSubset<T, RefeicaoCreateArgs<ExtArgs>>): Prisma__RefeicaoClient<$Result.GetResult<Prisma.$RefeicaoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Refeicaos.
     * @param {RefeicaoCreateManyArgs} args - Arguments to create many Refeicaos.
     * @example
     * // Create many Refeicaos
     * const refeicao = await prisma.refeicao.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RefeicaoCreateManyArgs>(args?: SelectSubset<T, RefeicaoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Refeicaos and returns the data saved in the database.
     * @param {RefeicaoCreateManyAndReturnArgs} args - Arguments to create many Refeicaos.
     * @example
     * // Create many Refeicaos
     * const refeicao = await prisma.refeicao.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Refeicaos and only return the `id`
     * const refeicaoWithIdOnly = await prisma.refeicao.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RefeicaoCreateManyAndReturnArgs>(args?: SelectSubset<T, RefeicaoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RefeicaoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Refeicao.
     * @param {RefeicaoDeleteArgs} args - Arguments to delete one Refeicao.
     * @example
     * // Delete one Refeicao
     * const Refeicao = await prisma.refeicao.delete({
     *   where: {
     *     // ... filter to delete one Refeicao
     *   }
     * })
     * 
     */
    delete<T extends RefeicaoDeleteArgs>(args: SelectSubset<T, RefeicaoDeleteArgs<ExtArgs>>): Prisma__RefeicaoClient<$Result.GetResult<Prisma.$RefeicaoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Refeicao.
     * @param {RefeicaoUpdateArgs} args - Arguments to update one Refeicao.
     * @example
     * // Update one Refeicao
     * const refeicao = await prisma.refeicao.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RefeicaoUpdateArgs>(args: SelectSubset<T, RefeicaoUpdateArgs<ExtArgs>>): Prisma__RefeicaoClient<$Result.GetResult<Prisma.$RefeicaoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Refeicaos.
     * @param {RefeicaoDeleteManyArgs} args - Arguments to filter Refeicaos to delete.
     * @example
     * // Delete a few Refeicaos
     * const { count } = await prisma.refeicao.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RefeicaoDeleteManyArgs>(args?: SelectSubset<T, RefeicaoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Refeicaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefeicaoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Refeicaos
     * const refeicao = await prisma.refeicao.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RefeicaoUpdateManyArgs>(args: SelectSubset<T, RefeicaoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Refeicaos and returns the data updated in the database.
     * @param {RefeicaoUpdateManyAndReturnArgs} args - Arguments to update many Refeicaos.
     * @example
     * // Update many Refeicaos
     * const refeicao = await prisma.refeicao.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Refeicaos and only return the `id`
     * const refeicaoWithIdOnly = await prisma.refeicao.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RefeicaoUpdateManyAndReturnArgs>(args: SelectSubset<T, RefeicaoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RefeicaoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Refeicao.
     * @param {RefeicaoUpsertArgs} args - Arguments to update or create a Refeicao.
     * @example
     * // Update or create a Refeicao
     * const refeicao = await prisma.refeicao.upsert({
     *   create: {
     *     // ... data to create a Refeicao
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Refeicao we want to update
     *   }
     * })
     */
    upsert<T extends RefeicaoUpsertArgs>(args: SelectSubset<T, RefeicaoUpsertArgs<ExtArgs>>): Prisma__RefeicaoClient<$Result.GetResult<Prisma.$RefeicaoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Refeicaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefeicaoCountArgs} args - Arguments to filter Refeicaos to count.
     * @example
     * // Count the number of Refeicaos
     * const count = await prisma.refeicao.count({
     *   where: {
     *     // ... the filter for the Refeicaos we want to count
     *   }
     * })
    **/
    count<T extends RefeicaoCountArgs>(
      args?: Subset<T, RefeicaoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RefeicaoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Refeicao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefeicaoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RefeicaoAggregateArgs>(args: Subset<T, RefeicaoAggregateArgs>): Prisma.PrismaPromise<GetRefeicaoAggregateType<T>>

    /**
     * Group by Refeicao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefeicaoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RefeicaoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RefeicaoGroupByArgs['orderBy'] }
        : { orderBy?: RefeicaoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RefeicaoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRefeicaoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Refeicao model
   */
  readonly fields: RefeicaoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Refeicao.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RefeicaoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    usuario<T extends UsuarioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioDefaultArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Refeicao model
   */
  interface RefeicaoFieldRefs {
    readonly id: FieldRef<"Refeicao", 'String'>
    readonly horario: FieldRef<"Refeicao", 'String'>
    readonly descricao: FieldRef<"Refeicao", 'String'>
    readonly usuarioId: FieldRef<"Refeicao", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Refeicao findUnique
   */
  export type RefeicaoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Refeicao
     */
    select?: RefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Refeicao
     */
    omit?: RefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefeicaoInclude<ExtArgs> | null
    /**
     * Filter, which Refeicao to fetch.
     */
    where: RefeicaoWhereUniqueInput
  }

  /**
   * Refeicao findUniqueOrThrow
   */
  export type RefeicaoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Refeicao
     */
    select?: RefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Refeicao
     */
    omit?: RefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefeicaoInclude<ExtArgs> | null
    /**
     * Filter, which Refeicao to fetch.
     */
    where: RefeicaoWhereUniqueInput
  }

  /**
   * Refeicao findFirst
   */
  export type RefeicaoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Refeicao
     */
    select?: RefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Refeicao
     */
    omit?: RefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefeicaoInclude<ExtArgs> | null
    /**
     * Filter, which Refeicao to fetch.
     */
    where?: RefeicaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Refeicaos to fetch.
     */
    orderBy?: RefeicaoOrderByWithRelationInput | RefeicaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Refeicaos.
     */
    cursor?: RefeicaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Refeicaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Refeicaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Refeicaos.
     */
    distinct?: RefeicaoScalarFieldEnum | RefeicaoScalarFieldEnum[]
  }

  /**
   * Refeicao findFirstOrThrow
   */
  export type RefeicaoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Refeicao
     */
    select?: RefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Refeicao
     */
    omit?: RefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefeicaoInclude<ExtArgs> | null
    /**
     * Filter, which Refeicao to fetch.
     */
    where?: RefeicaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Refeicaos to fetch.
     */
    orderBy?: RefeicaoOrderByWithRelationInput | RefeicaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Refeicaos.
     */
    cursor?: RefeicaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Refeicaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Refeicaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Refeicaos.
     */
    distinct?: RefeicaoScalarFieldEnum | RefeicaoScalarFieldEnum[]
  }

  /**
   * Refeicao findMany
   */
  export type RefeicaoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Refeicao
     */
    select?: RefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Refeicao
     */
    omit?: RefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefeicaoInclude<ExtArgs> | null
    /**
     * Filter, which Refeicaos to fetch.
     */
    where?: RefeicaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Refeicaos to fetch.
     */
    orderBy?: RefeicaoOrderByWithRelationInput | RefeicaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Refeicaos.
     */
    cursor?: RefeicaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Refeicaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Refeicaos.
     */
    skip?: number
    distinct?: RefeicaoScalarFieldEnum | RefeicaoScalarFieldEnum[]
  }

  /**
   * Refeicao create
   */
  export type RefeicaoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Refeicao
     */
    select?: RefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Refeicao
     */
    omit?: RefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefeicaoInclude<ExtArgs> | null
    /**
     * The data needed to create a Refeicao.
     */
    data: XOR<RefeicaoCreateInput, RefeicaoUncheckedCreateInput>
  }

  /**
   * Refeicao createMany
   */
  export type RefeicaoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Refeicaos.
     */
    data: RefeicaoCreateManyInput | RefeicaoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Refeicao createManyAndReturn
   */
  export type RefeicaoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Refeicao
     */
    select?: RefeicaoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Refeicao
     */
    omit?: RefeicaoOmit<ExtArgs> | null
    /**
     * The data used to create many Refeicaos.
     */
    data: RefeicaoCreateManyInput | RefeicaoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefeicaoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Refeicao update
   */
  export type RefeicaoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Refeicao
     */
    select?: RefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Refeicao
     */
    omit?: RefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefeicaoInclude<ExtArgs> | null
    /**
     * The data needed to update a Refeicao.
     */
    data: XOR<RefeicaoUpdateInput, RefeicaoUncheckedUpdateInput>
    /**
     * Choose, which Refeicao to update.
     */
    where: RefeicaoWhereUniqueInput
  }

  /**
   * Refeicao updateMany
   */
  export type RefeicaoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Refeicaos.
     */
    data: XOR<RefeicaoUpdateManyMutationInput, RefeicaoUncheckedUpdateManyInput>
    /**
     * Filter which Refeicaos to update
     */
    where?: RefeicaoWhereInput
    /**
     * Limit how many Refeicaos to update.
     */
    limit?: number
  }

  /**
   * Refeicao updateManyAndReturn
   */
  export type RefeicaoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Refeicao
     */
    select?: RefeicaoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Refeicao
     */
    omit?: RefeicaoOmit<ExtArgs> | null
    /**
     * The data used to update Refeicaos.
     */
    data: XOR<RefeicaoUpdateManyMutationInput, RefeicaoUncheckedUpdateManyInput>
    /**
     * Filter which Refeicaos to update
     */
    where?: RefeicaoWhereInput
    /**
     * Limit how many Refeicaos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefeicaoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Refeicao upsert
   */
  export type RefeicaoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Refeicao
     */
    select?: RefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Refeicao
     */
    omit?: RefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefeicaoInclude<ExtArgs> | null
    /**
     * The filter to search for the Refeicao to update in case it exists.
     */
    where: RefeicaoWhereUniqueInput
    /**
     * In case the Refeicao found by the `where` argument doesn't exist, create a new Refeicao with this data.
     */
    create: XOR<RefeicaoCreateInput, RefeicaoUncheckedCreateInput>
    /**
     * In case the Refeicao was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RefeicaoUpdateInput, RefeicaoUncheckedUpdateInput>
  }

  /**
   * Refeicao delete
   */
  export type RefeicaoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Refeicao
     */
    select?: RefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Refeicao
     */
    omit?: RefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefeicaoInclude<ExtArgs> | null
    /**
     * Filter which Refeicao to delete.
     */
    where: RefeicaoWhereUniqueInput
  }

  /**
   * Refeicao deleteMany
   */
  export type RefeicaoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Refeicaos to delete
     */
    where?: RefeicaoWhereInput
    /**
     * Limit how many Refeicaos to delete.
     */
    limit?: number
  }

  /**
   * Refeicao without action
   */
  export type RefeicaoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Refeicao
     */
    select?: RefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Refeicao
     */
    omit?: RefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefeicaoInclude<ExtArgs> | null
  }


  /**
   * Model RegistroRefeicao
   */

  export type AggregateRegistroRefeicao = {
    _count: RegistroRefeicaoCountAggregateOutputType | null
    _min: RegistroRefeicaoMinAggregateOutputType | null
    _max: RegistroRefeicaoMaxAggregateOutputType | null
  }

  export type RegistroRefeicaoMinAggregateOutputType = {
    id: string | null
    data: Date | null
    horario: string | null
    descricao: string | null
    tipoIcone: string | null
    foto: string | null
    usuarioId: string | null
  }

  export type RegistroRefeicaoMaxAggregateOutputType = {
    id: string | null
    data: Date | null
    horario: string | null
    descricao: string | null
    tipoIcone: string | null
    foto: string | null
    usuarioId: string | null
  }

  export type RegistroRefeicaoCountAggregateOutputType = {
    id: number
    data: number
    horario: number
    descricao: number
    tipoIcone: number
    foto: number
    usuarioId: number
    _all: number
  }


  export type RegistroRefeicaoMinAggregateInputType = {
    id?: true
    data?: true
    horario?: true
    descricao?: true
    tipoIcone?: true
    foto?: true
    usuarioId?: true
  }

  export type RegistroRefeicaoMaxAggregateInputType = {
    id?: true
    data?: true
    horario?: true
    descricao?: true
    tipoIcone?: true
    foto?: true
    usuarioId?: true
  }

  export type RegistroRefeicaoCountAggregateInputType = {
    id?: true
    data?: true
    horario?: true
    descricao?: true
    tipoIcone?: true
    foto?: true
    usuarioId?: true
    _all?: true
  }

  export type RegistroRefeicaoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RegistroRefeicao to aggregate.
     */
    where?: RegistroRefeicaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroRefeicaos to fetch.
     */
    orderBy?: RegistroRefeicaoOrderByWithRelationInput | RegistroRefeicaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RegistroRefeicaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroRefeicaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroRefeicaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RegistroRefeicaos
    **/
    _count?: true | RegistroRefeicaoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RegistroRefeicaoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RegistroRefeicaoMaxAggregateInputType
  }

  export type GetRegistroRefeicaoAggregateType<T extends RegistroRefeicaoAggregateArgs> = {
        [P in keyof T & keyof AggregateRegistroRefeicao]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRegistroRefeicao[P]>
      : GetScalarType<T[P], AggregateRegistroRefeicao[P]>
  }




  export type RegistroRefeicaoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RegistroRefeicaoWhereInput
    orderBy?: RegistroRefeicaoOrderByWithAggregationInput | RegistroRefeicaoOrderByWithAggregationInput[]
    by: RegistroRefeicaoScalarFieldEnum[] | RegistroRefeicaoScalarFieldEnum
    having?: RegistroRefeicaoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RegistroRefeicaoCountAggregateInputType | true
    _min?: RegistroRefeicaoMinAggregateInputType
    _max?: RegistroRefeicaoMaxAggregateInputType
  }

  export type RegistroRefeicaoGroupByOutputType = {
    id: string
    data: Date
    horario: string
    descricao: string
    tipoIcone: string | null
    foto: string | null
    usuarioId: string
    _count: RegistroRefeicaoCountAggregateOutputType | null
    _min: RegistroRefeicaoMinAggregateOutputType | null
    _max: RegistroRefeicaoMaxAggregateOutputType | null
  }

  type GetRegistroRefeicaoGroupByPayload<T extends RegistroRefeicaoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RegistroRefeicaoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RegistroRefeicaoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RegistroRefeicaoGroupByOutputType[P]>
            : GetScalarType<T[P], RegistroRefeicaoGroupByOutputType[P]>
        }
      >
    >


  export type RegistroRefeicaoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    data?: boolean
    horario?: boolean
    descricao?: boolean
    tipoIcone?: boolean
    foto?: boolean
    usuarioId?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["registroRefeicao"]>

  export type RegistroRefeicaoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    data?: boolean
    horario?: boolean
    descricao?: boolean
    tipoIcone?: boolean
    foto?: boolean
    usuarioId?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["registroRefeicao"]>

  export type RegistroRefeicaoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    data?: boolean
    horario?: boolean
    descricao?: boolean
    tipoIcone?: boolean
    foto?: boolean
    usuarioId?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["registroRefeicao"]>

  export type RegistroRefeicaoSelectScalar = {
    id?: boolean
    data?: boolean
    horario?: boolean
    descricao?: boolean
    tipoIcone?: boolean
    foto?: boolean
    usuarioId?: boolean
  }

  export type RegistroRefeicaoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "data" | "horario" | "descricao" | "tipoIcone" | "foto" | "usuarioId", ExtArgs["result"]["registroRefeicao"]>
  export type RegistroRefeicaoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }
  export type RegistroRefeicaoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }
  export type RegistroRefeicaoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }

  export type $RegistroRefeicaoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RegistroRefeicao"
    objects: {
      usuario: Prisma.$UsuarioPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      data: Date
      horario: string
      descricao: string
      tipoIcone: string | null
      foto: string | null
      usuarioId: string
    }, ExtArgs["result"]["registroRefeicao"]>
    composites: {}
  }

  type RegistroRefeicaoGetPayload<S extends boolean | null | undefined | RegistroRefeicaoDefaultArgs> = $Result.GetResult<Prisma.$RegistroRefeicaoPayload, S>

  type RegistroRefeicaoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RegistroRefeicaoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RegistroRefeicaoCountAggregateInputType | true
    }

  export interface RegistroRefeicaoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RegistroRefeicao'], meta: { name: 'RegistroRefeicao' } }
    /**
     * Find zero or one RegistroRefeicao that matches the filter.
     * @param {RegistroRefeicaoFindUniqueArgs} args - Arguments to find a RegistroRefeicao
     * @example
     * // Get one RegistroRefeicao
     * const registroRefeicao = await prisma.registroRefeicao.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RegistroRefeicaoFindUniqueArgs>(args: SelectSubset<T, RegistroRefeicaoFindUniqueArgs<ExtArgs>>): Prisma__RegistroRefeicaoClient<$Result.GetResult<Prisma.$RegistroRefeicaoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RegistroRefeicao that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RegistroRefeicaoFindUniqueOrThrowArgs} args - Arguments to find a RegistroRefeicao
     * @example
     * // Get one RegistroRefeicao
     * const registroRefeicao = await prisma.registroRefeicao.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RegistroRefeicaoFindUniqueOrThrowArgs>(args: SelectSubset<T, RegistroRefeicaoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RegistroRefeicaoClient<$Result.GetResult<Prisma.$RegistroRefeicaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RegistroRefeicao that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroRefeicaoFindFirstArgs} args - Arguments to find a RegistroRefeicao
     * @example
     * // Get one RegistroRefeicao
     * const registroRefeicao = await prisma.registroRefeicao.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RegistroRefeicaoFindFirstArgs>(args?: SelectSubset<T, RegistroRefeicaoFindFirstArgs<ExtArgs>>): Prisma__RegistroRefeicaoClient<$Result.GetResult<Prisma.$RegistroRefeicaoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RegistroRefeicao that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroRefeicaoFindFirstOrThrowArgs} args - Arguments to find a RegistroRefeicao
     * @example
     * // Get one RegistroRefeicao
     * const registroRefeicao = await prisma.registroRefeicao.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RegistroRefeicaoFindFirstOrThrowArgs>(args?: SelectSubset<T, RegistroRefeicaoFindFirstOrThrowArgs<ExtArgs>>): Prisma__RegistroRefeicaoClient<$Result.GetResult<Prisma.$RegistroRefeicaoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RegistroRefeicaos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroRefeicaoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RegistroRefeicaos
     * const registroRefeicaos = await prisma.registroRefeicao.findMany()
     * 
     * // Get first 10 RegistroRefeicaos
     * const registroRefeicaos = await prisma.registroRefeicao.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const registroRefeicaoWithIdOnly = await prisma.registroRefeicao.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RegistroRefeicaoFindManyArgs>(args?: SelectSubset<T, RegistroRefeicaoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroRefeicaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RegistroRefeicao.
     * @param {RegistroRefeicaoCreateArgs} args - Arguments to create a RegistroRefeicao.
     * @example
     * // Create one RegistroRefeicao
     * const RegistroRefeicao = await prisma.registroRefeicao.create({
     *   data: {
     *     // ... data to create a RegistroRefeicao
     *   }
     * })
     * 
     */
    create<T extends RegistroRefeicaoCreateArgs>(args: SelectSubset<T, RegistroRefeicaoCreateArgs<ExtArgs>>): Prisma__RegistroRefeicaoClient<$Result.GetResult<Prisma.$RegistroRefeicaoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RegistroRefeicaos.
     * @param {RegistroRefeicaoCreateManyArgs} args - Arguments to create many RegistroRefeicaos.
     * @example
     * // Create many RegistroRefeicaos
     * const registroRefeicao = await prisma.registroRefeicao.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RegistroRefeicaoCreateManyArgs>(args?: SelectSubset<T, RegistroRefeicaoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RegistroRefeicaos and returns the data saved in the database.
     * @param {RegistroRefeicaoCreateManyAndReturnArgs} args - Arguments to create many RegistroRefeicaos.
     * @example
     * // Create many RegistroRefeicaos
     * const registroRefeicao = await prisma.registroRefeicao.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RegistroRefeicaos and only return the `id`
     * const registroRefeicaoWithIdOnly = await prisma.registroRefeicao.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RegistroRefeicaoCreateManyAndReturnArgs>(args?: SelectSubset<T, RegistroRefeicaoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroRefeicaoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RegistroRefeicao.
     * @param {RegistroRefeicaoDeleteArgs} args - Arguments to delete one RegistroRefeicao.
     * @example
     * // Delete one RegistroRefeicao
     * const RegistroRefeicao = await prisma.registroRefeicao.delete({
     *   where: {
     *     // ... filter to delete one RegistroRefeicao
     *   }
     * })
     * 
     */
    delete<T extends RegistroRefeicaoDeleteArgs>(args: SelectSubset<T, RegistroRefeicaoDeleteArgs<ExtArgs>>): Prisma__RegistroRefeicaoClient<$Result.GetResult<Prisma.$RegistroRefeicaoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RegistroRefeicao.
     * @param {RegistroRefeicaoUpdateArgs} args - Arguments to update one RegistroRefeicao.
     * @example
     * // Update one RegistroRefeicao
     * const registroRefeicao = await prisma.registroRefeicao.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RegistroRefeicaoUpdateArgs>(args: SelectSubset<T, RegistroRefeicaoUpdateArgs<ExtArgs>>): Prisma__RegistroRefeicaoClient<$Result.GetResult<Prisma.$RegistroRefeicaoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RegistroRefeicaos.
     * @param {RegistroRefeicaoDeleteManyArgs} args - Arguments to filter RegistroRefeicaos to delete.
     * @example
     * // Delete a few RegistroRefeicaos
     * const { count } = await prisma.registroRefeicao.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RegistroRefeicaoDeleteManyArgs>(args?: SelectSubset<T, RegistroRefeicaoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RegistroRefeicaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroRefeicaoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RegistroRefeicaos
     * const registroRefeicao = await prisma.registroRefeicao.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RegistroRefeicaoUpdateManyArgs>(args: SelectSubset<T, RegistroRefeicaoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RegistroRefeicaos and returns the data updated in the database.
     * @param {RegistroRefeicaoUpdateManyAndReturnArgs} args - Arguments to update many RegistroRefeicaos.
     * @example
     * // Update many RegistroRefeicaos
     * const registroRefeicao = await prisma.registroRefeicao.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RegistroRefeicaos and only return the `id`
     * const registroRefeicaoWithIdOnly = await prisma.registroRefeicao.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RegistroRefeicaoUpdateManyAndReturnArgs>(args: SelectSubset<T, RegistroRefeicaoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroRefeicaoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RegistroRefeicao.
     * @param {RegistroRefeicaoUpsertArgs} args - Arguments to update or create a RegistroRefeicao.
     * @example
     * // Update or create a RegistroRefeicao
     * const registroRefeicao = await prisma.registroRefeicao.upsert({
     *   create: {
     *     // ... data to create a RegistroRefeicao
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RegistroRefeicao we want to update
     *   }
     * })
     */
    upsert<T extends RegistroRefeicaoUpsertArgs>(args: SelectSubset<T, RegistroRefeicaoUpsertArgs<ExtArgs>>): Prisma__RegistroRefeicaoClient<$Result.GetResult<Prisma.$RegistroRefeicaoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RegistroRefeicaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroRefeicaoCountArgs} args - Arguments to filter RegistroRefeicaos to count.
     * @example
     * // Count the number of RegistroRefeicaos
     * const count = await prisma.registroRefeicao.count({
     *   where: {
     *     // ... the filter for the RegistroRefeicaos we want to count
     *   }
     * })
    **/
    count<T extends RegistroRefeicaoCountArgs>(
      args?: Subset<T, RegistroRefeicaoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RegistroRefeicaoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RegistroRefeicao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroRefeicaoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RegistroRefeicaoAggregateArgs>(args: Subset<T, RegistroRefeicaoAggregateArgs>): Prisma.PrismaPromise<GetRegistroRefeicaoAggregateType<T>>

    /**
     * Group by RegistroRefeicao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroRefeicaoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RegistroRefeicaoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RegistroRefeicaoGroupByArgs['orderBy'] }
        : { orderBy?: RegistroRefeicaoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RegistroRefeicaoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRegistroRefeicaoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RegistroRefeicao model
   */
  readonly fields: RegistroRefeicaoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RegistroRefeicao.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RegistroRefeicaoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    usuario<T extends UsuarioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioDefaultArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RegistroRefeicao model
   */
  interface RegistroRefeicaoFieldRefs {
    readonly id: FieldRef<"RegistroRefeicao", 'String'>
    readonly data: FieldRef<"RegistroRefeicao", 'DateTime'>
    readonly horario: FieldRef<"RegistroRefeicao", 'String'>
    readonly descricao: FieldRef<"RegistroRefeicao", 'String'>
    readonly tipoIcone: FieldRef<"RegistroRefeicao", 'String'>
    readonly foto: FieldRef<"RegistroRefeicao", 'String'>
    readonly usuarioId: FieldRef<"RegistroRefeicao", 'String'>
  }
    

  // Custom InputTypes
  /**
   * RegistroRefeicao findUnique
   */
  export type RegistroRefeicaoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroRefeicao
     */
    select?: RegistroRefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroRefeicao
     */
    omit?: RegistroRefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroRefeicaoInclude<ExtArgs> | null
    /**
     * Filter, which RegistroRefeicao to fetch.
     */
    where: RegistroRefeicaoWhereUniqueInput
  }

  /**
   * RegistroRefeicao findUniqueOrThrow
   */
  export type RegistroRefeicaoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroRefeicao
     */
    select?: RegistroRefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroRefeicao
     */
    omit?: RegistroRefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroRefeicaoInclude<ExtArgs> | null
    /**
     * Filter, which RegistroRefeicao to fetch.
     */
    where: RegistroRefeicaoWhereUniqueInput
  }

  /**
   * RegistroRefeicao findFirst
   */
  export type RegistroRefeicaoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroRefeicao
     */
    select?: RegistroRefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroRefeicao
     */
    omit?: RegistroRefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroRefeicaoInclude<ExtArgs> | null
    /**
     * Filter, which RegistroRefeicao to fetch.
     */
    where?: RegistroRefeicaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroRefeicaos to fetch.
     */
    orderBy?: RegistroRefeicaoOrderByWithRelationInput | RegistroRefeicaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RegistroRefeicaos.
     */
    cursor?: RegistroRefeicaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroRefeicaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroRefeicaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RegistroRefeicaos.
     */
    distinct?: RegistroRefeicaoScalarFieldEnum | RegistroRefeicaoScalarFieldEnum[]
  }

  /**
   * RegistroRefeicao findFirstOrThrow
   */
  export type RegistroRefeicaoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroRefeicao
     */
    select?: RegistroRefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroRefeicao
     */
    omit?: RegistroRefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroRefeicaoInclude<ExtArgs> | null
    /**
     * Filter, which RegistroRefeicao to fetch.
     */
    where?: RegistroRefeicaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroRefeicaos to fetch.
     */
    orderBy?: RegistroRefeicaoOrderByWithRelationInput | RegistroRefeicaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RegistroRefeicaos.
     */
    cursor?: RegistroRefeicaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroRefeicaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroRefeicaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RegistroRefeicaos.
     */
    distinct?: RegistroRefeicaoScalarFieldEnum | RegistroRefeicaoScalarFieldEnum[]
  }

  /**
   * RegistroRefeicao findMany
   */
  export type RegistroRefeicaoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroRefeicao
     */
    select?: RegistroRefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroRefeicao
     */
    omit?: RegistroRefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroRefeicaoInclude<ExtArgs> | null
    /**
     * Filter, which RegistroRefeicaos to fetch.
     */
    where?: RegistroRefeicaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroRefeicaos to fetch.
     */
    orderBy?: RegistroRefeicaoOrderByWithRelationInput | RegistroRefeicaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RegistroRefeicaos.
     */
    cursor?: RegistroRefeicaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroRefeicaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroRefeicaos.
     */
    skip?: number
    distinct?: RegistroRefeicaoScalarFieldEnum | RegistroRefeicaoScalarFieldEnum[]
  }

  /**
   * RegistroRefeicao create
   */
  export type RegistroRefeicaoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroRefeicao
     */
    select?: RegistroRefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroRefeicao
     */
    omit?: RegistroRefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroRefeicaoInclude<ExtArgs> | null
    /**
     * The data needed to create a RegistroRefeicao.
     */
    data: XOR<RegistroRefeicaoCreateInput, RegistroRefeicaoUncheckedCreateInput>
  }

  /**
   * RegistroRefeicao createMany
   */
  export type RegistroRefeicaoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RegistroRefeicaos.
     */
    data: RegistroRefeicaoCreateManyInput | RegistroRefeicaoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RegistroRefeicao createManyAndReturn
   */
  export type RegistroRefeicaoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroRefeicao
     */
    select?: RegistroRefeicaoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroRefeicao
     */
    omit?: RegistroRefeicaoOmit<ExtArgs> | null
    /**
     * The data used to create many RegistroRefeicaos.
     */
    data: RegistroRefeicaoCreateManyInput | RegistroRefeicaoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroRefeicaoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RegistroRefeicao update
   */
  export type RegistroRefeicaoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroRefeicao
     */
    select?: RegistroRefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroRefeicao
     */
    omit?: RegistroRefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroRefeicaoInclude<ExtArgs> | null
    /**
     * The data needed to update a RegistroRefeicao.
     */
    data: XOR<RegistroRefeicaoUpdateInput, RegistroRefeicaoUncheckedUpdateInput>
    /**
     * Choose, which RegistroRefeicao to update.
     */
    where: RegistroRefeicaoWhereUniqueInput
  }

  /**
   * RegistroRefeicao updateMany
   */
  export type RegistroRefeicaoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RegistroRefeicaos.
     */
    data: XOR<RegistroRefeicaoUpdateManyMutationInput, RegistroRefeicaoUncheckedUpdateManyInput>
    /**
     * Filter which RegistroRefeicaos to update
     */
    where?: RegistroRefeicaoWhereInput
    /**
     * Limit how many RegistroRefeicaos to update.
     */
    limit?: number
  }

  /**
   * RegistroRefeicao updateManyAndReturn
   */
  export type RegistroRefeicaoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroRefeicao
     */
    select?: RegistroRefeicaoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroRefeicao
     */
    omit?: RegistroRefeicaoOmit<ExtArgs> | null
    /**
     * The data used to update RegistroRefeicaos.
     */
    data: XOR<RegistroRefeicaoUpdateManyMutationInput, RegistroRefeicaoUncheckedUpdateManyInput>
    /**
     * Filter which RegistroRefeicaos to update
     */
    where?: RegistroRefeicaoWhereInput
    /**
     * Limit how many RegistroRefeicaos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroRefeicaoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RegistroRefeicao upsert
   */
  export type RegistroRefeicaoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroRefeicao
     */
    select?: RegistroRefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroRefeicao
     */
    omit?: RegistroRefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroRefeicaoInclude<ExtArgs> | null
    /**
     * The filter to search for the RegistroRefeicao to update in case it exists.
     */
    where: RegistroRefeicaoWhereUniqueInput
    /**
     * In case the RegistroRefeicao found by the `where` argument doesn't exist, create a new RegistroRefeicao with this data.
     */
    create: XOR<RegistroRefeicaoCreateInput, RegistroRefeicaoUncheckedCreateInput>
    /**
     * In case the RegistroRefeicao was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RegistroRefeicaoUpdateInput, RegistroRefeicaoUncheckedUpdateInput>
  }

  /**
   * RegistroRefeicao delete
   */
  export type RegistroRefeicaoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroRefeicao
     */
    select?: RegistroRefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroRefeicao
     */
    omit?: RegistroRefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroRefeicaoInclude<ExtArgs> | null
    /**
     * Filter which RegistroRefeicao to delete.
     */
    where: RegistroRefeicaoWhereUniqueInput
  }

  /**
   * RegistroRefeicao deleteMany
   */
  export type RegistroRefeicaoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RegistroRefeicaos to delete
     */
    where?: RegistroRefeicaoWhereInput
    /**
     * Limit how many RegistroRefeicaos to delete.
     */
    limit?: number
  }

  /**
   * RegistroRefeicao without action
   */
  export type RegistroRefeicaoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroRefeicao
     */
    select?: RegistroRefeicaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroRefeicao
     */
    omit?: RegistroRefeicaoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroRefeicaoInclude<ExtArgs> | null
  }


  /**
   * Model RegistroHidratacao
   */

  export type AggregateRegistroHidratacao = {
    _count: RegistroHidratacaoCountAggregateOutputType | null
    _avg: RegistroHidratacaoAvgAggregateOutputType | null
    _sum: RegistroHidratacaoSumAggregateOutputType | null
    _min: RegistroHidratacaoMinAggregateOutputType | null
    _max: RegistroHidratacaoMaxAggregateOutputType | null
  }

  export type RegistroHidratacaoAvgAggregateOutputType = {
    quantidade: number | null
  }

  export type RegistroHidratacaoSumAggregateOutputType = {
    quantidade: number | null
  }

  export type RegistroHidratacaoMinAggregateOutputType = {
    id: string | null
    data: Date | null
    horario: string | null
    quantidade: number | null
    usuarioId: string | null
  }

  export type RegistroHidratacaoMaxAggregateOutputType = {
    id: string | null
    data: Date | null
    horario: string | null
    quantidade: number | null
    usuarioId: string | null
  }

  export type RegistroHidratacaoCountAggregateOutputType = {
    id: number
    data: number
    horario: number
    quantidade: number
    usuarioId: number
    _all: number
  }


  export type RegistroHidratacaoAvgAggregateInputType = {
    quantidade?: true
  }

  export type RegistroHidratacaoSumAggregateInputType = {
    quantidade?: true
  }

  export type RegistroHidratacaoMinAggregateInputType = {
    id?: true
    data?: true
    horario?: true
    quantidade?: true
    usuarioId?: true
  }

  export type RegistroHidratacaoMaxAggregateInputType = {
    id?: true
    data?: true
    horario?: true
    quantidade?: true
    usuarioId?: true
  }

  export type RegistroHidratacaoCountAggregateInputType = {
    id?: true
    data?: true
    horario?: true
    quantidade?: true
    usuarioId?: true
    _all?: true
  }

  export type RegistroHidratacaoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RegistroHidratacao to aggregate.
     */
    where?: RegistroHidratacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroHidratacaos to fetch.
     */
    orderBy?: RegistroHidratacaoOrderByWithRelationInput | RegistroHidratacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RegistroHidratacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroHidratacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroHidratacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RegistroHidratacaos
    **/
    _count?: true | RegistroHidratacaoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RegistroHidratacaoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RegistroHidratacaoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RegistroHidratacaoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RegistroHidratacaoMaxAggregateInputType
  }

  export type GetRegistroHidratacaoAggregateType<T extends RegistroHidratacaoAggregateArgs> = {
        [P in keyof T & keyof AggregateRegistroHidratacao]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRegistroHidratacao[P]>
      : GetScalarType<T[P], AggregateRegistroHidratacao[P]>
  }




  export type RegistroHidratacaoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RegistroHidratacaoWhereInput
    orderBy?: RegistroHidratacaoOrderByWithAggregationInput | RegistroHidratacaoOrderByWithAggregationInput[]
    by: RegistroHidratacaoScalarFieldEnum[] | RegistroHidratacaoScalarFieldEnum
    having?: RegistroHidratacaoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RegistroHidratacaoCountAggregateInputType | true
    _avg?: RegistroHidratacaoAvgAggregateInputType
    _sum?: RegistroHidratacaoSumAggregateInputType
    _min?: RegistroHidratacaoMinAggregateInputType
    _max?: RegistroHidratacaoMaxAggregateInputType
  }

  export type RegistroHidratacaoGroupByOutputType = {
    id: string
    data: Date
    horario: string
    quantidade: number
    usuarioId: string
    _count: RegistroHidratacaoCountAggregateOutputType | null
    _avg: RegistroHidratacaoAvgAggregateOutputType | null
    _sum: RegistroHidratacaoSumAggregateOutputType | null
    _min: RegistroHidratacaoMinAggregateOutputType | null
    _max: RegistroHidratacaoMaxAggregateOutputType | null
  }

  type GetRegistroHidratacaoGroupByPayload<T extends RegistroHidratacaoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RegistroHidratacaoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RegistroHidratacaoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RegistroHidratacaoGroupByOutputType[P]>
            : GetScalarType<T[P], RegistroHidratacaoGroupByOutputType[P]>
        }
      >
    >


  export type RegistroHidratacaoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    data?: boolean
    horario?: boolean
    quantidade?: boolean
    usuarioId?: boolean
  }, ExtArgs["result"]["registroHidratacao"]>

  export type RegistroHidratacaoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    data?: boolean
    horario?: boolean
    quantidade?: boolean
    usuarioId?: boolean
  }, ExtArgs["result"]["registroHidratacao"]>

  export type RegistroHidratacaoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    data?: boolean
    horario?: boolean
    quantidade?: boolean
    usuarioId?: boolean
  }, ExtArgs["result"]["registroHidratacao"]>

  export type RegistroHidratacaoSelectScalar = {
    id?: boolean
    data?: boolean
    horario?: boolean
    quantidade?: boolean
    usuarioId?: boolean
  }

  export type RegistroHidratacaoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "data" | "horario" | "quantidade" | "usuarioId", ExtArgs["result"]["registroHidratacao"]>

  export type $RegistroHidratacaoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RegistroHidratacao"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      data: Date
      horario: string
      quantidade: number
      usuarioId: string
    }, ExtArgs["result"]["registroHidratacao"]>
    composites: {}
  }

  type RegistroHidratacaoGetPayload<S extends boolean | null | undefined | RegistroHidratacaoDefaultArgs> = $Result.GetResult<Prisma.$RegistroHidratacaoPayload, S>

  type RegistroHidratacaoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RegistroHidratacaoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RegistroHidratacaoCountAggregateInputType | true
    }

  export interface RegistroHidratacaoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RegistroHidratacao'], meta: { name: 'RegistroHidratacao' } }
    /**
     * Find zero or one RegistroHidratacao that matches the filter.
     * @param {RegistroHidratacaoFindUniqueArgs} args - Arguments to find a RegistroHidratacao
     * @example
     * // Get one RegistroHidratacao
     * const registroHidratacao = await prisma.registroHidratacao.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RegistroHidratacaoFindUniqueArgs>(args: SelectSubset<T, RegistroHidratacaoFindUniqueArgs<ExtArgs>>): Prisma__RegistroHidratacaoClient<$Result.GetResult<Prisma.$RegistroHidratacaoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RegistroHidratacao that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RegistroHidratacaoFindUniqueOrThrowArgs} args - Arguments to find a RegistroHidratacao
     * @example
     * // Get one RegistroHidratacao
     * const registroHidratacao = await prisma.registroHidratacao.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RegistroHidratacaoFindUniqueOrThrowArgs>(args: SelectSubset<T, RegistroHidratacaoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RegistroHidratacaoClient<$Result.GetResult<Prisma.$RegistroHidratacaoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RegistroHidratacao that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroHidratacaoFindFirstArgs} args - Arguments to find a RegistroHidratacao
     * @example
     * // Get one RegistroHidratacao
     * const registroHidratacao = await prisma.registroHidratacao.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RegistroHidratacaoFindFirstArgs>(args?: SelectSubset<T, RegistroHidratacaoFindFirstArgs<ExtArgs>>): Prisma__RegistroHidratacaoClient<$Result.GetResult<Prisma.$RegistroHidratacaoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RegistroHidratacao that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroHidratacaoFindFirstOrThrowArgs} args - Arguments to find a RegistroHidratacao
     * @example
     * // Get one RegistroHidratacao
     * const registroHidratacao = await prisma.registroHidratacao.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RegistroHidratacaoFindFirstOrThrowArgs>(args?: SelectSubset<T, RegistroHidratacaoFindFirstOrThrowArgs<ExtArgs>>): Prisma__RegistroHidratacaoClient<$Result.GetResult<Prisma.$RegistroHidratacaoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RegistroHidratacaos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroHidratacaoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RegistroHidratacaos
     * const registroHidratacaos = await prisma.registroHidratacao.findMany()
     * 
     * // Get first 10 RegistroHidratacaos
     * const registroHidratacaos = await prisma.registroHidratacao.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const registroHidratacaoWithIdOnly = await prisma.registroHidratacao.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RegistroHidratacaoFindManyArgs>(args?: SelectSubset<T, RegistroHidratacaoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroHidratacaoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RegistroHidratacao.
     * @param {RegistroHidratacaoCreateArgs} args - Arguments to create a RegistroHidratacao.
     * @example
     * // Create one RegistroHidratacao
     * const RegistroHidratacao = await prisma.registroHidratacao.create({
     *   data: {
     *     // ... data to create a RegistroHidratacao
     *   }
     * })
     * 
     */
    create<T extends RegistroHidratacaoCreateArgs>(args: SelectSubset<T, RegistroHidratacaoCreateArgs<ExtArgs>>): Prisma__RegistroHidratacaoClient<$Result.GetResult<Prisma.$RegistroHidratacaoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RegistroHidratacaos.
     * @param {RegistroHidratacaoCreateManyArgs} args - Arguments to create many RegistroHidratacaos.
     * @example
     * // Create many RegistroHidratacaos
     * const registroHidratacao = await prisma.registroHidratacao.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RegistroHidratacaoCreateManyArgs>(args?: SelectSubset<T, RegistroHidratacaoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RegistroHidratacaos and returns the data saved in the database.
     * @param {RegistroHidratacaoCreateManyAndReturnArgs} args - Arguments to create many RegistroHidratacaos.
     * @example
     * // Create many RegistroHidratacaos
     * const registroHidratacao = await prisma.registroHidratacao.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RegistroHidratacaos and only return the `id`
     * const registroHidratacaoWithIdOnly = await prisma.registroHidratacao.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RegistroHidratacaoCreateManyAndReturnArgs>(args?: SelectSubset<T, RegistroHidratacaoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroHidratacaoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RegistroHidratacao.
     * @param {RegistroHidratacaoDeleteArgs} args - Arguments to delete one RegistroHidratacao.
     * @example
     * // Delete one RegistroHidratacao
     * const RegistroHidratacao = await prisma.registroHidratacao.delete({
     *   where: {
     *     // ... filter to delete one RegistroHidratacao
     *   }
     * })
     * 
     */
    delete<T extends RegistroHidratacaoDeleteArgs>(args: SelectSubset<T, RegistroHidratacaoDeleteArgs<ExtArgs>>): Prisma__RegistroHidratacaoClient<$Result.GetResult<Prisma.$RegistroHidratacaoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RegistroHidratacao.
     * @param {RegistroHidratacaoUpdateArgs} args - Arguments to update one RegistroHidratacao.
     * @example
     * // Update one RegistroHidratacao
     * const registroHidratacao = await prisma.registroHidratacao.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RegistroHidratacaoUpdateArgs>(args: SelectSubset<T, RegistroHidratacaoUpdateArgs<ExtArgs>>): Prisma__RegistroHidratacaoClient<$Result.GetResult<Prisma.$RegistroHidratacaoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RegistroHidratacaos.
     * @param {RegistroHidratacaoDeleteManyArgs} args - Arguments to filter RegistroHidratacaos to delete.
     * @example
     * // Delete a few RegistroHidratacaos
     * const { count } = await prisma.registroHidratacao.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RegistroHidratacaoDeleteManyArgs>(args?: SelectSubset<T, RegistroHidratacaoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RegistroHidratacaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroHidratacaoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RegistroHidratacaos
     * const registroHidratacao = await prisma.registroHidratacao.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RegistroHidratacaoUpdateManyArgs>(args: SelectSubset<T, RegistroHidratacaoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RegistroHidratacaos and returns the data updated in the database.
     * @param {RegistroHidratacaoUpdateManyAndReturnArgs} args - Arguments to update many RegistroHidratacaos.
     * @example
     * // Update many RegistroHidratacaos
     * const registroHidratacao = await prisma.registroHidratacao.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RegistroHidratacaos and only return the `id`
     * const registroHidratacaoWithIdOnly = await prisma.registroHidratacao.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RegistroHidratacaoUpdateManyAndReturnArgs>(args: SelectSubset<T, RegistroHidratacaoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroHidratacaoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RegistroHidratacao.
     * @param {RegistroHidratacaoUpsertArgs} args - Arguments to update or create a RegistroHidratacao.
     * @example
     * // Update or create a RegistroHidratacao
     * const registroHidratacao = await prisma.registroHidratacao.upsert({
     *   create: {
     *     // ... data to create a RegistroHidratacao
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RegistroHidratacao we want to update
     *   }
     * })
     */
    upsert<T extends RegistroHidratacaoUpsertArgs>(args: SelectSubset<T, RegistroHidratacaoUpsertArgs<ExtArgs>>): Prisma__RegistroHidratacaoClient<$Result.GetResult<Prisma.$RegistroHidratacaoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RegistroHidratacaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroHidratacaoCountArgs} args - Arguments to filter RegistroHidratacaos to count.
     * @example
     * // Count the number of RegistroHidratacaos
     * const count = await prisma.registroHidratacao.count({
     *   where: {
     *     // ... the filter for the RegistroHidratacaos we want to count
     *   }
     * })
    **/
    count<T extends RegistroHidratacaoCountArgs>(
      args?: Subset<T, RegistroHidratacaoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RegistroHidratacaoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RegistroHidratacao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroHidratacaoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RegistroHidratacaoAggregateArgs>(args: Subset<T, RegistroHidratacaoAggregateArgs>): Prisma.PrismaPromise<GetRegistroHidratacaoAggregateType<T>>

    /**
     * Group by RegistroHidratacao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroHidratacaoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RegistroHidratacaoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RegistroHidratacaoGroupByArgs['orderBy'] }
        : { orderBy?: RegistroHidratacaoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RegistroHidratacaoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRegistroHidratacaoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RegistroHidratacao model
   */
  readonly fields: RegistroHidratacaoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RegistroHidratacao.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RegistroHidratacaoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RegistroHidratacao model
   */
  interface RegistroHidratacaoFieldRefs {
    readonly id: FieldRef<"RegistroHidratacao", 'String'>
    readonly data: FieldRef<"RegistroHidratacao", 'DateTime'>
    readonly horario: FieldRef<"RegistroHidratacao", 'String'>
    readonly quantidade: FieldRef<"RegistroHidratacao", 'Int'>
    readonly usuarioId: FieldRef<"RegistroHidratacao", 'String'>
  }
    

  // Custom InputTypes
  /**
   * RegistroHidratacao findUnique
   */
  export type RegistroHidratacaoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroHidratacao
     */
    select?: RegistroHidratacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroHidratacao
     */
    omit?: RegistroHidratacaoOmit<ExtArgs> | null
    /**
     * Filter, which RegistroHidratacao to fetch.
     */
    where: RegistroHidratacaoWhereUniqueInput
  }

  /**
   * RegistroHidratacao findUniqueOrThrow
   */
  export type RegistroHidratacaoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroHidratacao
     */
    select?: RegistroHidratacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroHidratacao
     */
    omit?: RegistroHidratacaoOmit<ExtArgs> | null
    /**
     * Filter, which RegistroHidratacao to fetch.
     */
    where: RegistroHidratacaoWhereUniqueInput
  }

  /**
   * RegistroHidratacao findFirst
   */
  export type RegistroHidratacaoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroHidratacao
     */
    select?: RegistroHidratacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroHidratacao
     */
    omit?: RegistroHidratacaoOmit<ExtArgs> | null
    /**
     * Filter, which RegistroHidratacao to fetch.
     */
    where?: RegistroHidratacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroHidratacaos to fetch.
     */
    orderBy?: RegistroHidratacaoOrderByWithRelationInput | RegistroHidratacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RegistroHidratacaos.
     */
    cursor?: RegistroHidratacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroHidratacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroHidratacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RegistroHidratacaos.
     */
    distinct?: RegistroHidratacaoScalarFieldEnum | RegistroHidratacaoScalarFieldEnum[]
  }

  /**
   * RegistroHidratacao findFirstOrThrow
   */
  export type RegistroHidratacaoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroHidratacao
     */
    select?: RegistroHidratacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroHidratacao
     */
    omit?: RegistroHidratacaoOmit<ExtArgs> | null
    /**
     * Filter, which RegistroHidratacao to fetch.
     */
    where?: RegistroHidratacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroHidratacaos to fetch.
     */
    orderBy?: RegistroHidratacaoOrderByWithRelationInput | RegistroHidratacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RegistroHidratacaos.
     */
    cursor?: RegistroHidratacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroHidratacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroHidratacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RegistroHidratacaos.
     */
    distinct?: RegistroHidratacaoScalarFieldEnum | RegistroHidratacaoScalarFieldEnum[]
  }

  /**
   * RegistroHidratacao findMany
   */
  export type RegistroHidratacaoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroHidratacao
     */
    select?: RegistroHidratacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroHidratacao
     */
    omit?: RegistroHidratacaoOmit<ExtArgs> | null
    /**
     * Filter, which RegistroHidratacaos to fetch.
     */
    where?: RegistroHidratacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroHidratacaos to fetch.
     */
    orderBy?: RegistroHidratacaoOrderByWithRelationInput | RegistroHidratacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RegistroHidratacaos.
     */
    cursor?: RegistroHidratacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroHidratacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroHidratacaos.
     */
    skip?: number
    distinct?: RegistroHidratacaoScalarFieldEnum | RegistroHidratacaoScalarFieldEnum[]
  }

  /**
   * RegistroHidratacao create
   */
  export type RegistroHidratacaoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroHidratacao
     */
    select?: RegistroHidratacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroHidratacao
     */
    omit?: RegistroHidratacaoOmit<ExtArgs> | null
    /**
     * The data needed to create a RegistroHidratacao.
     */
    data: XOR<RegistroHidratacaoCreateInput, RegistroHidratacaoUncheckedCreateInput>
  }

  /**
   * RegistroHidratacao createMany
   */
  export type RegistroHidratacaoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RegistroHidratacaos.
     */
    data: RegistroHidratacaoCreateManyInput | RegistroHidratacaoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RegistroHidratacao createManyAndReturn
   */
  export type RegistroHidratacaoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroHidratacao
     */
    select?: RegistroHidratacaoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroHidratacao
     */
    omit?: RegistroHidratacaoOmit<ExtArgs> | null
    /**
     * The data used to create many RegistroHidratacaos.
     */
    data: RegistroHidratacaoCreateManyInput | RegistroHidratacaoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RegistroHidratacao update
   */
  export type RegistroHidratacaoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroHidratacao
     */
    select?: RegistroHidratacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroHidratacao
     */
    omit?: RegistroHidratacaoOmit<ExtArgs> | null
    /**
     * The data needed to update a RegistroHidratacao.
     */
    data: XOR<RegistroHidratacaoUpdateInput, RegistroHidratacaoUncheckedUpdateInput>
    /**
     * Choose, which RegistroHidratacao to update.
     */
    where: RegistroHidratacaoWhereUniqueInput
  }

  /**
   * RegistroHidratacao updateMany
   */
  export type RegistroHidratacaoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RegistroHidratacaos.
     */
    data: XOR<RegistroHidratacaoUpdateManyMutationInput, RegistroHidratacaoUncheckedUpdateManyInput>
    /**
     * Filter which RegistroHidratacaos to update
     */
    where?: RegistroHidratacaoWhereInput
    /**
     * Limit how many RegistroHidratacaos to update.
     */
    limit?: number
  }

  /**
   * RegistroHidratacao updateManyAndReturn
   */
  export type RegistroHidratacaoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroHidratacao
     */
    select?: RegistroHidratacaoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroHidratacao
     */
    omit?: RegistroHidratacaoOmit<ExtArgs> | null
    /**
     * The data used to update RegistroHidratacaos.
     */
    data: XOR<RegistroHidratacaoUpdateManyMutationInput, RegistroHidratacaoUncheckedUpdateManyInput>
    /**
     * Filter which RegistroHidratacaos to update
     */
    where?: RegistroHidratacaoWhereInput
    /**
     * Limit how many RegistroHidratacaos to update.
     */
    limit?: number
  }

  /**
   * RegistroHidratacao upsert
   */
  export type RegistroHidratacaoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroHidratacao
     */
    select?: RegistroHidratacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroHidratacao
     */
    omit?: RegistroHidratacaoOmit<ExtArgs> | null
    /**
     * The filter to search for the RegistroHidratacao to update in case it exists.
     */
    where: RegistroHidratacaoWhereUniqueInput
    /**
     * In case the RegistroHidratacao found by the `where` argument doesn't exist, create a new RegistroHidratacao with this data.
     */
    create: XOR<RegistroHidratacaoCreateInput, RegistroHidratacaoUncheckedCreateInput>
    /**
     * In case the RegistroHidratacao was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RegistroHidratacaoUpdateInput, RegistroHidratacaoUncheckedUpdateInput>
  }

  /**
   * RegistroHidratacao delete
   */
  export type RegistroHidratacaoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroHidratacao
     */
    select?: RegistroHidratacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroHidratacao
     */
    omit?: RegistroHidratacaoOmit<ExtArgs> | null
    /**
     * Filter which RegistroHidratacao to delete.
     */
    where: RegistroHidratacaoWhereUniqueInput
  }

  /**
   * RegistroHidratacao deleteMany
   */
  export type RegistroHidratacaoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RegistroHidratacaos to delete
     */
    where?: RegistroHidratacaoWhereInput
    /**
     * Limit how many RegistroHidratacaos to delete.
     */
    limit?: number
  }

  /**
   * RegistroHidratacao without action
   */
  export type RegistroHidratacaoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroHidratacao
     */
    select?: RegistroHidratacaoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroHidratacao
     */
    omit?: RegistroHidratacaoOmit<ExtArgs> | null
  }


  /**
   * Model RegistroSono
   */

  export type AggregateRegistroSono = {
    _count: RegistroSonoCountAggregateOutputType | null
    _avg: RegistroSonoAvgAggregateOutputType | null
    _sum: RegistroSonoSumAggregateOutputType | null
    _min: RegistroSonoMinAggregateOutputType | null
    _max: RegistroSonoMaxAggregateOutputType | null
  }

  export type RegistroSonoAvgAggregateOutputType = {
    qualidade: number | null
  }

  export type RegistroSonoSumAggregateOutputType = {
    qualidade: number | null
  }

  export type RegistroSonoMinAggregateOutputType = {
    id: string | null
    inicio: Date | null
    fim: Date | null
    qualidade: number | null
    notas: string | null
    usuarioId: string | null
  }

  export type RegistroSonoMaxAggregateOutputType = {
    id: string | null
    inicio: Date | null
    fim: Date | null
    qualidade: number | null
    notas: string | null
    usuarioId: string | null
  }

  export type RegistroSonoCountAggregateOutputType = {
    id: number
    inicio: number
    fim: number
    qualidade: number
    notas: number
    usuarioId: number
    _all: number
  }


  export type RegistroSonoAvgAggregateInputType = {
    qualidade?: true
  }

  export type RegistroSonoSumAggregateInputType = {
    qualidade?: true
  }

  export type RegistroSonoMinAggregateInputType = {
    id?: true
    inicio?: true
    fim?: true
    qualidade?: true
    notas?: true
    usuarioId?: true
  }

  export type RegistroSonoMaxAggregateInputType = {
    id?: true
    inicio?: true
    fim?: true
    qualidade?: true
    notas?: true
    usuarioId?: true
  }

  export type RegistroSonoCountAggregateInputType = {
    id?: true
    inicio?: true
    fim?: true
    qualidade?: true
    notas?: true
    usuarioId?: true
    _all?: true
  }

  export type RegistroSonoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RegistroSono to aggregate.
     */
    where?: RegistroSonoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroSonos to fetch.
     */
    orderBy?: RegistroSonoOrderByWithRelationInput | RegistroSonoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RegistroSonoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroSonos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroSonos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RegistroSonos
    **/
    _count?: true | RegistroSonoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RegistroSonoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RegistroSonoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RegistroSonoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RegistroSonoMaxAggregateInputType
  }

  export type GetRegistroSonoAggregateType<T extends RegistroSonoAggregateArgs> = {
        [P in keyof T & keyof AggregateRegistroSono]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRegistroSono[P]>
      : GetScalarType<T[P], AggregateRegistroSono[P]>
  }




  export type RegistroSonoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RegistroSonoWhereInput
    orderBy?: RegistroSonoOrderByWithAggregationInput | RegistroSonoOrderByWithAggregationInput[]
    by: RegistroSonoScalarFieldEnum[] | RegistroSonoScalarFieldEnum
    having?: RegistroSonoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RegistroSonoCountAggregateInputType | true
    _avg?: RegistroSonoAvgAggregateInputType
    _sum?: RegistroSonoSumAggregateInputType
    _min?: RegistroSonoMinAggregateInputType
    _max?: RegistroSonoMaxAggregateInputType
  }

  export type RegistroSonoGroupByOutputType = {
    id: string
    inicio: Date
    fim: Date | null
    qualidade: number | null
    notas: string | null
    usuarioId: string
    _count: RegistroSonoCountAggregateOutputType | null
    _avg: RegistroSonoAvgAggregateOutputType | null
    _sum: RegistroSonoSumAggregateOutputType | null
    _min: RegistroSonoMinAggregateOutputType | null
    _max: RegistroSonoMaxAggregateOutputType | null
  }

  type GetRegistroSonoGroupByPayload<T extends RegistroSonoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RegistroSonoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RegistroSonoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RegistroSonoGroupByOutputType[P]>
            : GetScalarType<T[P], RegistroSonoGroupByOutputType[P]>
        }
      >
    >


  export type RegistroSonoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    inicio?: boolean
    fim?: boolean
    qualidade?: boolean
    notas?: boolean
    usuarioId?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["registroSono"]>

  export type RegistroSonoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    inicio?: boolean
    fim?: boolean
    qualidade?: boolean
    notas?: boolean
    usuarioId?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["registroSono"]>

  export type RegistroSonoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    inicio?: boolean
    fim?: boolean
    qualidade?: boolean
    notas?: boolean
    usuarioId?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["registroSono"]>

  export type RegistroSonoSelectScalar = {
    id?: boolean
    inicio?: boolean
    fim?: boolean
    qualidade?: boolean
    notas?: boolean
    usuarioId?: boolean
  }

  export type RegistroSonoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "inicio" | "fim" | "qualidade" | "notas" | "usuarioId", ExtArgs["result"]["registroSono"]>
  export type RegistroSonoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }
  export type RegistroSonoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }
  export type RegistroSonoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }

  export type $RegistroSonoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RegistroSono"
    objects: {
      usuario: Prisma.$UsuarioPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      inicio: Date
      fim: Date | null
      qualidade: number | null
      notas: string | null
      usuarioId: string
    }, ExtArgs["result"]["registroSono"]>
    composites: {}
  }

  type RegistroSonoGetPayload<S extends boolean | null | undefined | RegistroSonoDefaultArgs> = $Result.GetResult<Prisma.$RegistroSonoPayload, S>

  type RegistroSonoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RegistroSonoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RegistroSonoCountAggregateInputType | true
    }

  export interface RegistroSonoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RegistroSono'], meta: { name: 'RegistroSono' } }
    /**
     * Find zero or one RegistroSono that matches the filter.
     * @param {RegistroSonoFindUniqueArgs} args - Arguments to find a RegistroSono
     * @example
     * // Get one RegistroSono
     * const registroSono = await prisma.registroSono.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RegistroSonoFindUniqueArgs>(args: SelectSubset<T, RegistroSonoFindUniqueArgs<ExtArgs>>): Prisma__RegistroSonoClient<$Result.GetResult<Prisma.$RegistroSonoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RegistroSono that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RegistroSonoFindUniqueOrThrowArgs} args - Arguments to find a RegistroSono
     * @example
     * // Get one RegistroSono
     * const registroSono = await prisma.registroSono.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RegistroSonoFindUniqueOrThrowArgs>(args: SelectSubset<T, RegistroSonoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RegistroSonoClient<$Result.GetResult<Prisma.$RegistroSonoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RegistroSono that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroSonoFindFirstArgs} args - Arguments to find a RegistroSono
     * @example
     * // Get one RegistroSono
     * const registroSono = await prisma.registroSono.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RegistroSonoFindFirstArgs>(args?: SelectSubset<T, RegistroSonoFindFirstArgs<ExtArgs>>): Prisma__RegistroSonoClient<$Result.GetResult<Prisma.$RegistroSonoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RegistroSono that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroSonoFindFirstOrThrowArgs} args - Arguments to find a RegistroSono
     * @example
     * // Get one RegistroSono
     * const registroSono = await prisma.registroSono.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RegistroSonoFindFirstOrThrowArgs>(args?: SelectSubset<T, RegistroSonoFindFirstOrThrowArgs<ExtArgs>>): Prisma__RegistroSonoClient<$Result.GetResult<Prisma.$RegistroSonoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RegistroSonos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroSonoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RegistroSonos
     * const registroSonos = await prisma.registroSono.findMany()
     * 
     * // Get first 10 RegistroSonos
     * const registroSonos = await prisma.registroSono.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const registroSonoWithIdOnly = await prisma.registroSono.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RegistroSonoFindManyArgs>(args?: SelectSubset<T, RegistroSonoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroSonoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RegistroSono.
     * @param {RegistroSonoCreateArgs} args - Arguments to create a RegistroSono.
     * @example
     * // Create one RegistroSono
     * const RegistroSono = await prisma.registroSono.create({
     *   data: {
     *     // ... data to create a RegistroSono
     *   }
     * })
     * 
     */
    create<T extends RegistroSonoCreateArgs>(args: SelectSubset<T, RegistroSonoCreateArgs<ExtArgs>>): Prisma__RegistroSonoClient<$Result.GetResult<Prisma.$RegistroSonoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RegistroSonos.
     * @param {RegistroSonoCreateManyArgs} args - Arguments to create many RegistroSonos.
     * @example
     * // Create many RegistroSonos
     * const registroSono = await prisma.registroSono.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RegistroSonoCreateManyArgs>(args?: SelectSubset<T, RegistroSonoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RegistroSonos and returns the data saved in the database.
     * @param {RegistroSonoCreateManyAndReturnArgs} args - Arguments to create many RegistroSonos.
     * @example
     * // Create many RegistroSonos
     * const registroSono = await prisma.registroSono.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RegistroSonos and only return the `id`
     * const registroSonoWithIdOnly = await prisma.registroSono.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RegistroSonoCreateManyAndReturnArgs>(args?: SelectSubset<T, RegistroSonoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroSonoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RegistroSono.
     * @param {RegistroSonoDeleteArgs} args - Arguments to delete one RegistroSono.
     * @example
     * // Delete one RegistroSono
     * const RegistroSono = await prisma.registroSono.delete({
     *   where: {
     *     // ... filter to delete one RegistroSono
     *   }
     * })
     * 
     */
    delete<T extends RegistroSonoDeleteArgs>(args: SelectSubset<T, RegistroSonoDeleteArgs<ExtArgs>>): Prisma__RegistroSonoClient<$Result.GetResult<Prisma.$RegistroSonoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RegistroSono.
     * @param {RegistroSonoUpdateArgs} args - Arguments to update one RegistroSono.
     * @example
     * // Update one RegistroSono
     * const registroSono = await prisma.registroSono.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RegistroSonoUpdateArgs>(args: SelectSubset<T, RegistroSonoUpdateArgs<ExtArgs>>): Prisma__RegistroSonoClient<$Result.GetResult<Prisma.$RegistroSonoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RegistroSonos.
     * @param {RegistroSonoDeleteManyArgs} args - Arguments to filter RegistroSonos to delete.
     * @example
     * // Delete a few RegistroSonos
     * const { count } = await prisma.registroSono.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RegistroSonoDeleteManyArgs>(args?: SelectSubset<T, RegistroSonoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RegistroSonos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroSonoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RegistroSonos
     * const registroSono = await prisma.registroSono.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RegistroSonoUpdateManyArgs>(args: SelectSubset<T, RegistroSonoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RegistroSonos and returns the data updated in the database.
     * @param {RegistroSonoUpdateManyAndReturnArgs} args - Arguments to update many RegistroSonos.
     * @example
     * // Update many RegistroSonos
     * const registroSono = await prisma.registroSono.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RegistroSonos and only return the `id`
     * const registroSonoWithIdOnly = await prisma.registroSono.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RegistroSonoUpdateManyAndReturnArgs>(args: SelectSubset<T, RegistroSonoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroSonoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RegistroSono.
     * @param {RegistroSonoUpsertArgs} args - Arguments to update or create a RegistroSono.
     * @example
     * // Update or create a RegistroSono
     * const registroSono = await prisma.registroSono.upsert({
     *   create: {
     *     // ... data to create a RegistroSono
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RegistroSono we want to update
     *   }
     * })
     */
    upsert<T extends RegistroSonoUpsertArgs>(args: SelectSubset<T, RegistroSonoUpsertArgs<ExtArgs>>): Prisma__RegistroSonoClient<$Result.GetResult<Prisma.$RegistroSonoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RegistroSonos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroSonoCountArgs} args - Arguments to filter RegistroSonos to count.
     * @example
     * // Count the number of RegistroSonos
     * const count = await prisma.registroSono.count({
     *   where: {
     *     // ... the filter for the RegistroSonos we want to count
     *   }
     * })
    **/
    count<T extends RegistroSonoCountArgs>(
      args?: Subset<T, RegistroSonoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RegistroSonoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RegistroSono.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroSonoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RegistroSonoAggregateArgs>(args: Subset<T, RegistroSonoAggregateArgs>): Prisma.PrismaPromise<GetRegistroSonoAggregateType<T>>

    /**
     * Group by RegistroSono.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroSonoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RegistroSonoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RegistroSonoGroupByArgs['orderBy'] }
        : { orderBy?: RegistroSonoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RegistroSonoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRegistroSonoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RegistroSono model
   */
  readonly fields: RegistroSonoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RegistroSono.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RegistroSonoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    usuario<T extends UsuarioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioDefaultArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RegistroSono model
   */
  interface RegistroSonoFieldRefs {
    readonly id: FieldRef<"RegistroSono", 'String'>
    readonly inicio: FieldRef<"RegistroSono", 'DateTime'>
    readonly fim: FieldRef<"RegistroSono", 'DateTime'>
    readonly qualidade: FieldRef<"RegistroSono", 'Int'>
    readonly notas: FieldRef<"RegistroSono", 'String'>
    readonly usuarioId: FieldRef<"RegistroSono", 'String'>
  }
    

  // Custom InputTypes
  /**
   * RegistroSono findUnique
   */
  export type RegistroSonoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroSono
     */
    select?: RegistroSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroSono
     */
    omit?: RegistroSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroSonoInclude<ExtArgs> | null
    /**
     * Filter, which RegistroSono to fetch.
     */
    where: RegistroSonoWhereUniqueInput
  }

  /**
   * RegistroSono findUniqueOrThrow
   */
  export type RegistroSonoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroSono
     */
    select?: RegistroSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroSono
     */
    omit?: RegistroSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroSonoInclude<ExtArgs> | null
    /**
     * Filter, which RegistroSono to fetch.
     */
    where: RegistroSonoWhereUniqueInput
  }

  /**
   * RegistroSono findFirst
   */
  export type RegistroSonoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroSono
     */
    select?: RegistroSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroSono
     */
    omit?: RegistroSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroSonoInclude<ExtArgs> | null
    /**
     * Filter, which RegistroSono to fetch.
     */
    where?: RegistroSonoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroSonos to fetch.
     */
    orderBy?: RegistroSonoOrderByWithRelationInput | RegistroSonoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RegistroSonos.
     */
    cursor?: RegistroSonoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroSonos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroSonos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RegistroSonos.
     */
    distinct?: RegistroSonoScalarFieldEnum | RegistroSonoScalarFieldEnum[]
  }

  /**
   * RegistroSono findFirstOrThrow
   */
  export type RegistroSonoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroSono
     */
    select?: RegistroSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroSono
     */
    omit?: RegistroSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroSonoInclude<ExtArgs> | null
    /**
     * Filter, which RegistroSono to fetch.
     */
    where?: RegistroSonoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroSonos to fetch.
     */
    orderBy?: RegistroSonoOrderByWithRelationInput | RegistroSonoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RegistroSonos.
     */
    cursor?: RegistroSonoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroSonos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroSonos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RegistroSonos.
     */
    distinct?: RegistroSonoScalarFieldEnum | RegistroSonoScalarFieldEnum[]
  }

  /**
   * RegistroSono findMany
   */
  export type RegistroSonoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroSono
     */
    select?: RegistroSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroSono
     */
    omit?: RegistroSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroSonoInclude<ExtArgs> | null
    /**
     * Filter, which RegistroSonos to fetch.
     */
    where?: RegistroSonoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroSonos to fetch.
     */
    orderBy?: RegistroSonoOrderByWithRelationInput | RegistroSonoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RegistroSonos.
     */
    cursor?: RegistroSonoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroSonos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroSonos.
     */
    skip?: number
    distinct?: RegistroSonoScalarFieldEnum | RegistroSonoScalarFieldEnum[]
  }

  /**
   * RegistroSono create
   */
  export type RegistroSonoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroSono
     */
    select?: RegistroSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroSono
     */
    omit?: RegistroSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroSonoInclude<ExtArgs> | null
    /**
     * The data needed to create a RegistroSono.
     */
    data: XOR<RegistroSonoCreateInput, RegistroSonoUncheckedCreateInput>
  }

  /**
   * RegistroSono createMany
   */
  export type RegistroSonoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RegistroSonos.
     */
    data: RegistroSonoCreateManyInput | RegistroSonoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RegistroSono createManyAndReturn
   */
  export type RegistroSonoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroSono
     */
    select?: RegistroSonoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroSono
     */
    omit?: RegistroSonoOmit<ExtArgs> | null
    /**
     * The data used to create many RegistroSonos.
     */
    data: RegistroSonoCreateManyInput | RegistroSonoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroSonoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RegistroSono update
   */
  export type RegistroSonoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroSono
     */
    select?: RegistroSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroSono
     */
    omit?: RegistroSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroSonoInclude<ExtArgs> | null
    /**
     * The data needed to update a RegistroSono.
     */
    data: XOR<RegistroSonoUpdateInput, RegistroSonoUncheckedUpdateInput>
    /**
     * Choose, which RegistroSono to update.
     */
    where: RegistroSonoWhereUniqueInput
  }

  /**
   * RegistroSono updateMany
   */
  export type RegistroSonoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RegistroSonos.
     */
    data: XOR<RegistroSonoUpdateManyMutationInput, RegistroSonoUncheckedUpdateManyInput>
    /**
     * Filter which RegistroSonos to update
     */
    where?: RegistroSonoWhereInput
    /**
     * Limit how many RegistroSonos to update.
     */
    limit?: number
  }

  /**
   * RegistroSono updateManyAndReturn
   */
  export type RegistroSonoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroSono
     */
    select?: RegistroSonoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroSono
     */
    omit?: RegistroSonoOmit<ExtArgs> | null
    /**
     * The data used to update RegistroSonos.
     */
    data: XOR<RegistroSonoUpdateManyMutationInput, RegistroSonoUncheckedUpdateManyInput>
    /**
     * Filter which RegistroSonos to update
     */
    where?: RegistroSonoWhereInput
    /**
     * Limit how many RegistroSonos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroSonoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RegistroSono upsert
   */
  export type RegistroSonoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroSono
     */
    select?: RegistroSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroSono
     */
    omit?: RegistroSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroSonoInclude<ExtArgs> | null
    /**
     * The filter to search for the RegistroSono to update in case it exists.
     */
    where: RegistroSonoWhereUniqueInput
    /**
     * In case the RegistroSono found by the `where` argument doesn't exist, create a new RegistroSono with this data.
     */
    create: XOR<RegistroSonoCreateInput, RegistroSonoUncheckedCreateInput>
    /**
     * In case the RegistroSono was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RegistroSonoUpdateInput, RegistroSonoUncheckedUpdateInput>
  }

  /**
   * RegistroSono delete
   */
  export type RegistroSonoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroSono
     */
    select?: RegistroSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroSono
     */
    omit?: RegistroSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroSonoInclude<ExtArgs> | null
    /**
     * Filter which RegistroSono to delete.
     */
    where: RegistroSonoWhereUniqueInput
  }

  /**
   * RegistroSono deleteMany
   */
  export type RegistroSonoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RegistroSonos to delete
     */
    where?: RegistroSonoWhereInput
    /**
     * Limit how many RegistroSonos to delete.
     */
    limit?: number
  }

  /**
   * RegistroSono without action
   */
  export type RegistroSonoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroSono
     */
    select?: RegistroSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroSono
     */
    omit?: RegistroSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroSonoInclude<ExtArgs> | null
  }


  /**
   * Model LembreteSono
   */

  export type AggregateLembreteSono = {
    _count: LembreteSonoCountAggregateOutputType | null
    _avg: LembreteSonoAvgAggregateOutputType | null
    _sum: LembreteSonoSumAggregateOutputType | null
    _min: LembreteSonoMinAggregateOutputType | null
    _max: LembreteSonoMaxAggregateOutputType | null
  }

  export type LembreteSonoAvgAggregateOutputType = {
    diasSemana: number | null
  }

  export type LembreteSonoSumAggregateOutputType = {
    diasSemana: number[]
  }

  export type LembreteSonoMinAggregateOutputType = {
    id: string | null
    tipo: string | null
    horario: string | null
    ativo: boolean | null
    usuarioId: string | null
  }

  export type LembreteSonoMaxAggregateOutputType = {
    id: string | null
    tipo: string | null
    horario: string | null
    ativo: boolean | null
    usuarioId: string | null
  }

  export type LembreteSonoCountAggregateOutputType = {
    id: number
    tipo: number
    horario: number
    diasSemana: number
    ativo: number
    usuarioId: number
    _all: number
  }


  export type LembreteSonoAvgAggregateInputType = {
    diasSemana?: true
  }

  export type LembreteSonoSumAggregateInputType = {
    diasSemana?: true
  }

  export type LembreteSonoMinAggregateInputType = {
    id?: true
    tipo?: true
    horario?: true
    ativo?: true
    usuarioId?: true
  }

  export type LembreteSonoMaxAggregateInputType = {
    id?: true
    tipo?: true
    horario?: true
    ativo?: true
    usuarioId?: true
  }

  export type LembreteSonoCountAggregateInputType = {
    id?: true
    tipo?: true
    horario?: true
    diasSemana?: true
    ativo?: true
    usuarioId?: true
    _all?: true
  }

  export type LembreteSonoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LembreteSono to aggregate.
     */
    where?: LembreteSonoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LembreteSonos to fetch.
     */
    orderBy?: LembreteSonoOrderByWithRelationInput | LembreteSonoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LembreteSonoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LembreteSonos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LembreteSonos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LembreteSonos
    **/
    _count?: true | LembreteSonoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LembreteSonoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LembreteSonoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LembreteSonoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LembreteSonoMaxAggregateInputType
  }

  export type GetLembreteSonoAggregateType<T extends LembreteSonoAggregateArgs> = {
        [P in keyof T & keyof AggregateLembreteSono]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLembreteSono[P]>
      : GetScalarType<T[P], AggregateLembreteSono[P]>
  }




  export type LembreteSonoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LembreteSonoWhereInput
    orderBy?: LembreteSonoOrderByWithAggregationInput | LembreteSonoOrderByWithAggregationInput[]
    by: LembreteSonoScalarFieldEnum[] | LembreteSonoScalarFieldEnum
    having?: LembreteSonoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LembreteSonoCountAggregateInputType | true
    _avg?: LembreteSonoAvgAggregateInputType
    _sum?: LembreteSonoSumAggregateInputType
    _min?: LembreteSonoMinAggregateInputType
    _max?: LembreteSonoMaxAggregateInputType
  }

  export type LembreteSonoGroupByOutputType = {
    id: string
    tipo: string
    horario: string
    diasSemana: number[]
    ativo: boolean
    usuarioId: string
    _count: LembreteSonoCountAggregateOutputType | null
    _avg: LembreteSonoAvgAggregateOutputType | null
    _sum: LembreteSonoSumAggregateOutputType | null
    _min: LembreteSonoMinAggregateOutputType | null
    _max: LembreteSonoMaxAggregateOutputType | null
  }

  type GetLembreteSonoGroupByPayload<T extends LembreteSonoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LembreteSonoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LembreteSonoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LembreteSonoGroupByOutputType[P]>
            : GetScalarType<T[P], LembreteSonoGroupByOutputType[P]>
        }
      >
    >


  export type LembreteSonoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tipo?: boolean
    horario?: boolean
    diasSemana?: boolean
    ativo?: boolean
    usuarioId?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lembreteSono"]>

  export type LembreteSonoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tipo?: boolean
    horario?: boolean
    diasSemana?: boolean
    ativo?: boolean
    usuarioId?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lembreteSono"]>

  export type LembreteSonoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tipo?: boolean
    horario?: boolean
    diasSemana?: boolean
    ativo?: boolean
    usuarioId?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lembreteSono"]>

  export type LembreteSonoSelectScalar = {
    id?: boolean
    tipo?: boolean
    horario?: boolean
    diasSemana?: boolean
    ativo?: boolean
    usuarioId?: boolean
  }

  export type LembreteSonoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tipo" | "horario" | "diasSemana" | "ativo" | "usuarioId", ExtArgs["result"]["lembreteSono"]>
  export type LembreteSonoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }
  export type LembreteSonoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }
  export type LembreteSonoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }

  export type $LembreteSonoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LembreteSono"
    objects: {
      usuario: Prisma.$UsuarioPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tipo: string
      horario: string
      diasSemana: number[]
      ativo: boolean
      usuarioId: string
    }, ExtArgs["result"]["lembreteSono"]>
    composites: {}
  }

  type LembreteSonoGetPayload<S extends boolean | null | undefined | LembreteSonoDefaultArgs> = $Result.GetResult<Prisma.$LembreteSonoPayload, S>

  type LembreteSonoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LembreteSonoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LembreteSonoCountAggregateInputType | true
    }

  export interface LembreteSonoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LembreteSono'], meta: { name: 'LembreteSono' } }
    /**
     * Find zero or one LembreteSono that matches the filter.
     * @param {LembreteSonoFindUniqueArgs} args - Arguments to find a LembreteSono
     * @example
     * // Get one LembreteSono
     * const lembreteSono = await prisma.lembreteSono.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LembreteSonoFindUniqueArgs>(args: SelectSubset<T, LembreteSonoFindUniqueArgs<ExtArgs>>): Prisma__LembreteSonoClient<$Result.GetResult<Prisma.$LembreteSonoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LembreteSono that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LembreteSonoFindUniqueOrThrowArgs} args - Arguments to find a LembreteSono
     * @example
     * // Get one LembreteSono
     * const lembreteSono = await prisma.lembreteSono.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LembreteSonoFindUniqueOrThrowArgs>(args: SelectSubset<T, LembreteSonoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LembreteSonoClient<$Result.GetResult<Prisma.$LembreteSonoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LembreteSono that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LembreteSonoFindFirstArgs} args - Arguments to find a LembreteSono
     * @example
     * // Get one LembreteSono
     * const lembreteSono = await prisma.lembreteSono.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LembreteSonoFindFirstArgs>(args?: SelectSubset<T, LembreteSonoFindFirstArgs<ExtArgs>>): Prisma__LembreteSonoClient<$Result.GetResult<Prisma.$LembreteSonoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LembreteSono that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LembreteSonoFindFirstOrThrowArgs} args - Arguments to find a LembreteSono
     * @example
     * // Get one LembreteSono
     * const lembreteSono = await prisma.lembreteSono.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LembreteSonoFindFirstOrThrowArgs>(args?: SelectSubset<T, LembreteSonoFindFirstOrThrowArgs<ExtArgs>>): Prisma__LembreteSonoClient<$Result.GetResult<Prisma.$LembreteSonoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LembreteSonos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LembreteSonoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LembreteSonos
     * const lembreteSonos = await prisma.lembreteSono.findMany()
     * 
     * // Get first 10 LembreteSonos
     * const lembreteSonos = await prisma.lembreteSono.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const lembreteSonoWithIdOnly = await prisma.lembreteSono.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LembreteSonoFindManyArgs>(args?: SelectSubset<T, LembreteSonoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LembreteSonoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LembreteSono.
     * @param {LembreteSonoCreateArgs} args - Arguments to create a LembreteSono.
     * @example
     * // Create one LembreteSono
     * const LembreteSono = await prisma.lembreteSono.create({
     *   data: {
     *     // ... data to create a LembreteSono
     *   }
     * })
     * 
     */
    create<T extends LembreteSonoCreateArgs>(args: SelectSubset<T, LembreteSonoCreateArgs<ExtArgs>>): Prisma__LembreteSonoClient<$Result.GetResult<Prisma.$LembreteSonoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LembreteSonos.
     * @param {LembreteSonoCreateManyArgs} args - Arguments to create many LembreteSonos.
     * @example
     * // Create many LembreteSonos
     * const lembreteSono = await prisma.lembreteSono.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LembreteSonoCreateManyArgs>(args?: SelectSubset<T, LembreteSonoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LembreteSonos and returns the data saved in the database.
     * @param {LembreteSonoCreateManyAndReturnArgs} args - Arguments to create many LembreteSonos.
     * @example
     * // Create many LembreteSonos
     * const lembreteSono = await prisma.lembreteSono.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LembreteSonos and only return the `id`
     * const lembreteSonoWithIdOnly = await prisma.lembreteSono.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LembreteSonoCreateManyAndReturnArgs>(args?: SelectSubset<T, LembreteSonoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LembreteSonoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LembreteSono.
     * @param {LembreteSonoDeleteArgs} args - Arguments to delete one LembreteSono.
     * @example
     * // Delete one LembreteSono
     * const LembreteSono = await prisma.lembreteSono.delete({
     *   where: {
     *     // ... filter to delete one LembreteSono
     *   }
     * })
     * 
     */
    delete<T extends LembreteSonoDeleteArgs>(args: SelectSubset<T, LembreteSonoDeleteArgs<ExtArgs>>): Prisma__LembreteSonoClient<$Result.GetResult<Prisma.$LembreteSonoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LembreteSono.
     * @param {LembreteSonoUpdateArgs} args - Arguments to update one LembreteSono.
     * @example
     * // Update one LembreteSono
     * const lembreteSono = await prisma.lembreteSono.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LembreteSonoUpdateArgs>(args: SelectSubset<T, LembreteSonoUpdateArgs<ExtArgs>>): Prisma__LembreteSonoClient<$Result.GetResult<Prisma.$LembreteSonoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LembreteSonos.
     * @param {LembreteSonoDeleteManyArgs} args - Arguments to filter LembreteSonos to delete.
     * @example
     * // Delete a few LembreteSonos
     * const { count } = await prisma.lembreteSono.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LembreteSonoDeleteManyArgs>(args?: SelectSubset<T, LembreteSonoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LembreteSonos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LembreteSonoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LembreteSonos
     * const lembreteSono = await prisma.lembreteSono.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LembreteSonoUpdateManyArgs>(args: SelectSubset<T, LembreteSonoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LembreteSonos and returns the data updated in the database.
     * @param {LembreteSonoUpdateManyAndReturnArgs} args - Arguments to update many LembreteSonos.
     * @example
     * // Update many LembreteSonos
     * const lembreteSono = await prisma.lembreteSono.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LembreteSonos and only return the `id`
     * const lembreteSonoWithIdOnly = await prisma.lembreteSono.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LembreteSonoUpdateManyAndReturnArgs>(args: SelectSubset<T, LembreteSonoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LembreteSonoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LembreteSono.
     * @param {LembreteSonoUpsertArgs} args - Arguments to update or create a LembreteSono.
     * @example
     * // Update or create a LembreteSono
     * const lembreteSono = await prisma.lembreteSono.upsert({
     *   create: {
     *     // ... data to create a LembreteSono
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LembreteSono we want to update
     *   }
     * })
     */
    upsert<T extends LembreteSonoUpsertArgs>(args: SelectSubset<T, LembreteSonoUpsertArgs<ExtArgs>>): Prisma__LembreteSonoClient<$Result.GetResult<Prisma.$LembreteSonoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LembreteSonos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LembreteSonoCountArgs} args - Arguments to filter LembreteSonos to count.
     * @example
     * // Count the number of LembreteSonos
     * const count = await prisma.lembreteSono.count({
     *   where: {
     *     // ... the filter for the LembreteSonos we want to count
     *   }
     * })
    **/
    count<T extends LembreteSonoCountArgs>(
      args?: Subset<T, LembreteSonoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LembreteSonoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LembreteSono.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LembreteSonoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LembreteSonoAggregateArgs>(args: Subset<T, LembreteSonoAggregateArgs>): Prisma.PrismaPromise<GetLembreteSonoAggregateType<T>>

    /**
     * Group by LembreteSono.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LembreteSonoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LembreteSonoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LembreteSonoGroupByArgs['orderBy'] }
        : { orderBy?: LembreteSonoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LembreteSonoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLembreteSonoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LembreteSono model
   */
  readonly fields: LembreteSonoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LembreteSono.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LembreteSonoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    usuario<T extends UsuarioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioDefaultArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LembreteSono model
   */
  interface LembreteSonoFieldRefs {
    readonly id: FieldRef<"LembreteSono", 'String'>
    readonly tipo: FieldRef<"LembreteSono", 'String'>
    readonly horario: FieldRef<"LembreteSono", 'String'>
    readonly diasSemana: FieldRef<"LembreteSono", 'Int[]'>
    readonly ativo: FieldRef<"LembreteSono", 'Boolean'>
    readonly usuarioId: FieldRef<"LembreteSono", 'String'>
  }
    

  // Custom InputTypes
  /**
   * LembreteSono findUnique
   */
  export type LembreteSonoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LembreteSono
     */
    select?: LembreteSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LembreteSono
     */
    omit?: LembreteSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LembreteSonoInclude<ExtArgs> | null
    /**
     * Filter, which LembreteSono to fetch.
     */
    where: LembreteSonoWhereUniqueInput
  }

  /**
   * LembreteSono findUniqueOrThrow
   */
  export type LembreteSonoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LembreteSono
     */
    select?: LembreteSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LembreteSono
     */
    omit?: LembreteSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LembreteSonoInclude<ExtArgs> | null
    /**
     * Filter, which LembreteSono to fetch.
     */
    where: LembreteSonoWhereUniqueInput
  }

  /**
   * LembreteSono findFirst
   */
  export type LembreteSonoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LembreteSono
     */
    select?: LembreteSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LembreteSono
     */
    omit?: LembreteSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LembreteSonoInclude<ExtArgs> | null
    /**
     * Filter, which LembreteSono to fetch.
     */
    where?: LembreteSonoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LembreteSonos to fetch.
     */
    orderBy?: LembreteSonoOrderByWithRelationInput | LembreteSonoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LembreteSonos.
     */
    cursor?: LembreteSonoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LembreteSonos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LembreteSonos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LembreteSonos.
     */
    distinct?: LembreteSonoScalarFieldEnum | LembreteSonoScalarFieldEnum[]
  }

  /**
   * LembreteSono findFirstOrThrow
   */
  export type LembreteSonoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LembreteSono
     */
    select?: LembreteSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LembreteSono
     */
    omit?: LembreteSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LembreteSonoInclude<ExtArgs> | null
    /**
     * Filter, which LembreteSono to fetch.
     */
    where?: LembreteSonoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LembreteSonos to fetch.
     */
    orderBy?: LembreteSonoOrderByWithRelationInput | LembreteSonoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LembreteSonos.
     */
    cursor?: LembreteSonoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LembreteSonos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LembreteSonos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LembreteSonos.
     */
    distinct?: LembreteSonoScalarFieldEnum | LembreteSonoScalarFieldEnum[]
  }

  /**
   * LembreteSono findMany
   */
  export type LembreteSonoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LembreteSono
     */
    select?: LembreteSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LembreteSono
     */
    omit?: LembreteSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LembreteSonoInclude<ExtArgs> | null
    /**
     * Filter, which LembreteSonos to fetch.
     */
    where?: LembreteSonoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LembreteSonos to fetch.
     */
    orderBy?: LembreteSonoOrderByWithRelationInput | LembreteSonoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LembreteSonos.
     */
    cursor?: LembreteSonoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LembreteSonos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LembreteSonos.
     */
    skip?: number
    distinct?: LembreteSonoScalarFieldEnum | LembreteSonoScalarFieldEnum[]
  }

  /**
   * LembreteSono create
   */
  export type LembreteSonoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LembreteSono
     */
    select?: LembreteSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LembreteSono
     */
    omit?: LembreteSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LembreteSonoInclude<ExtArgs> | null
    /**
     * The data needed to create a LembreteSono.
     */
    data: XOR<LembreteSonoCreateInput, LembreteSonoUncheckedCreateInput>
  }

  /**
   * LembreteSono createMany
   */
  export type LembreteSonoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LembreteSonos.
     */
    data: LembreteSonoCreateManyInput | LembreteSonoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LembreteSono createManyAndReturn
   */
  export type LembreteSonoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LembreteSono
     */
    select?: LembreteSonoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LembreteSono
     */
    omit?: LembreteSonoOmit<ExtArgs> | null
    /**
     * The data used to create many LembreteSonos.
     */
    data: LembreteSonoCreateManyInput | LembreteSonoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LembreteSonoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * LembreteSono update
   */
  export type LembreteSonoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LembreteSono
     */
    select?: LembreteSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LembreteSono
     */
    omit?: LembreteSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LembreteSonoInclude<ExtArgs> | null
    /**
     * The data needed to update a LembreteSono.
     */
    data: XOR<LembreteSonoUpdateInput, LembreteSonoUncheckedUpdateInput>
    /**
     * Choose, which LembreteSono to update.
     */
    where: LembreteSonoWhereUniqueInput
  }

  /**
   * LembreteSono updateMany
   */
  export type LembreteSonoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LembreteSonos.
     */
    data: XOR<LembreteSonoUpdateManyMutationInput, LembreteSonoUncheckedUpdateManyInput>
    /**
     * Filter which LembreteSonos to update
     */
    where?: LembreteSonoWhereInput
    /**
     * Limit how many LembreteSonos to update.
     */
    limit?: number
  }

  /**
   * LembreteSono updateManyAndReturn
   */
  export type LembreteSonoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LembreteSono
     */
    select?: LembreteSonoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LembreteSono
     */
    omit?: LembreteSonoOmit<ExtArgs> | null
    /**
     * The data used to update LembreteSonos.
     */
    data: XOR<LembreteSonoUpdateManyMutationInput, LembreteSonoUncheckedUpdateManyInput>
    /**
     * Filter which LembreteSonos to update
     */
    where?: LembreteSonoWhereInput
    /**
     * Limit how many LembreteSonos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LembreteSonoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * LembreteSono upsert
   */
  export type LembreteSonoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LembreteSono
     */
    select?: LembreteSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LembreteSono
     */
    omit?: LembreteSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LembreteSonoInclude<ExtArgs> | null
    /**
     * The filter to search for the LembreteSono to update in case it exists.
     */
    where: LembreteSonoWhereUniqueInput
    /**
     * In case the LembreteSono found by the `where` argument doesn't exist, create a new LembreteSono with this data.
     */
    create: XOR<LembreteSonoCreateInput, LembreteSonoUncheckedCreateInput>
    /**
     * In case the LembreteSono was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LembreteSonoUpdateInput, LembreteSonoUncheckedUpdateInput>
  }

  /**
   * LembreteSono delete
   */
  export type LembreteSonoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LembreteSono
     */
    select?: LembreteSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LembreteSono
     */
    omit?: LembreteSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LembreteSonoInclude<ExtArgs> | null
    /**
     * Filter which LembreteSono to delete.
     */
    where: LembreteSonoWhereUniqueInput
  }

  /**
   * LembreteSono deleteMany
   */
  export type LembreteSonoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LembreteSonos to delete
     */
    where?: LembreteSonoWhereInput
    /**
     * Limit how many LembreteSonos to delete.
     */
    limit?: number
  }

  /**
   * LembreteSono without action
   */
  export type LembreteSonoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LembreteSono
     */
    select?: LembreteSonoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LembreteSono
     */
    omit?: LembreteSonoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LembreteSonoInclude<ExtArgs> | null
  }


  /**
   * Model Receita
   */

  export type AggregateReceita = {
    _count: ReceitaCountAggregateOutputType | null
    _avg: ReceitaAvgAggregateOutputType | null
    _sum: ReceitaSumAggregateOutputType | null
    _min: ReceitaMinAggregateOutputType | null
    _max: ReceitaMaxAggregateOutputType | null
  }

  export type ReceitaAvgAggregateOutputType = {
    tempoPreparo: number | null
    porcoes: number | null
  }

  export type ReceitaSumAggregateOutputType = {
    tempoPreparo: number | null
    porcoes: number | null
  }

  export type ReceitaMinAggregateOutputType = {
    id: string | null
    nome: string | null
    descricao: string | null
    tempoPreparo: number | null
    porcoes: number | null
    calorias: string | null
    imagem: string | null
    usuarioId: string | null
  }

  export type ReceitaMaxAggregateOutputType = {
    id: string | null
    nome: string | null
    descricao: string | null
    tempoPreparo: number | null
    porcoes: number | null
    calorias: string | null
    imagem: string | null
    usuarioId: string | null
  }

  export type ReceitaCountAggregateOutputType = {
    id: number
    nome: number
    descricao: number
    categorias: number
    tags: number
    tempoPreparo: number
    porcoes: number
    calorias: number
    imagem: number
    usuarioId: number
    _all: number
  }


  export type ReceitaAvgAggregateInputType = {
    tempoPreparo?: true
    porcoes?: true
  }

  export type ReceitaSumAggregateInputType = {
    tempoPreparo?: true
    porcoes?: true
  }

  export type ReceitaMinAggregateInputType = {
    id?: true
    nome?: true
    descricao?: true
    tempoPreparo?: true
    porcoes?: true
    calorias?: true
    imagem?: true
    usuarioId?: true
  }

  export type ReceitaMaxAggregateInputType = {
    id?: true
    nome?: true
    descricao?: true
    tempoPreparo?: true
    porcoes?: true
    calorias?: true
    imagem?: true
    usuarioId?: true
  }

  export type ReceitaCountAggregateInputType = {
    id?: true
    nome?: true
    descricao?: true
    categorias?: true
    tags?: true
    tempoPreparo?: true
    porcoes?: true
    calorias?: true
    imagem?: true
    usuarioId?: true
    _all?: true
  }

  export type ReceitaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Receita to aggregate.
     */
    where?: ReceitaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Receitas to fetch.
     */
    orderBy?: ReceitaOrderByWithRelationInput | ReceitaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReceitaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Receitas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Receitas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Receitas
    **/
    _count?: true | ReceitaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReceitaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReceitaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReceitaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReceitaMaxAggregateInputType
  }

  export type GetReceitaAggregateType<T extends ReceitaAggregateArgs> = {
        [P in keyof T & keyof AggregateReceita]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReceita[P]>
      : GetScalarType<T[P], AggregateReceita[P]>
  }




  export type ReceitaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReceitaWhereInput
    orderBy?: ReceitaOrderByWithAggregationInput | ReceitaOrderByWithAggregationInput[]
    by: ReceitaScalarFieldEnum[] | ReceitaScalarFieldEnum
    having?: ReceitaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReceitaCountAggregateInputType | true
    _avg?: ReceitaAvgAggregateInputType
    _sum?: ReceitaSumAggregateInputType
    _min?: ReceitaMinAggregateInputType
    _max?: ReceitaMaxAggregateInputType
  }

  export type ReceitaGroupByOutputType = {
    id: string
    nome: string
    descricao: string
    categorias: string[]
    tags: string[]
    tempoPreparo: number
    porcoes: number
    calorias: string
    imagem: string | null
    usuarioId: string
    _count: ReceitaCountAggregateOutputType | null
    _avg: ReceitaAvgAggregateOutputType | null
    _sum: ReceitaSumAggregateOutputType | null
    _min: ReceitaMinAggregateOutputType | null
    _max: ReceitaMaxAggregateOutputType | null
  }

  type GetReceitaGroupByPayload<T extends ReceitaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReceitaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReceitaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReceitaGroupByOutputType[P]>
            : GetScalarType<T[P], ReceitaGroupByOutputType[P]>
        }
      >
    >


  export type ReceitaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    descricao?: boolean
    categorias?: boolean
    tags?: boolean
    tempoPreparo?: boolean
    porcoes?: boolean
    calorias?: boolean
    imagem?: boolean
    usuarioId?: boolean
    ingredientes?: boolean | Receita$ingredientesArgs<ExtArgs>
    passos?: boolean | Receita$passosArgs<ExtArgs>
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
    favoritos?: boolean | Receita$favoritosArgs<ExtArgs>
    _count?: boolean | ReceitaCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receita"]>

  export type ReceitaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    descricao?: boolean
    categorias?: boolean
    tags?: boolean
    tempoPreparo?: boolean
    porcoes?: boolean
    calorias?: boolean
    imagem?: boolean
    usuarioId?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receita"]>

  export type ReceitaSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    descricao?: boolean
    categorias?: boolean
    tags?: boolean
    tempoPreparo?: boolean
    porcoes?: boolean
    calorias?: boolean
    imagem?: boolean
    usuarioId?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receita"]>

  export type ReceitaSelectScalar = {
    id?: boolean
    nome?: boolean
    descricao?: boolean
    categorias?: boolean
    tags?: boolean
    tempoPreparo?: boolean
    porcoes?: boolean
    calorias?: boolean
    imagem?: boolean
    usuarioId?: boolean
  }

  export type ReceitaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nome" | "descricao" | "categorias" | "tags" | "tempoPreparo" | "porcoes" | "calorias" | "imagem" | "usuarioId", ExtArgs["result"]["receita"]>
  export type ReceitaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ingredientes?: boolean | Receita$ingredientesArgs<ExtArgs>
    passos?: boolean | Receita$passosArgs<ExtArgs>
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
    favoritos?: boolean | Receita$favoritosArgs<ExtArgs>
    _count?: boolean | ReceitaCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ReceitaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }
  export type ReceitaIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }

  export type $ReceitaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Receita"
    objects: {
      ingredientes: Prisma.$IngredientePayload<ExtArgs>[]
      passos: Prisma.$PassoReceitaPayload<ExtArgs>[]
      usuario: Prisma.$UsuarioPayload<ExtArgs>
      favoritos: Prisma.$ReceitaFavoritaPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nome: string
      descricao: string
      categorias: string[]
      tags: string[]
      tempoPreparo: number
      porcoes: number
      calorias: string
      imagem: string | null
      usuarioId: string
    }, ExtArgs["result"]["receita"]>
    composites: {}
  }

  type ReceitaGetPayload<S extends boolean | null | undefined | ReceitaDefaultArgs> = $Result.GetResult<Prisma.$ReceitaPayload, S>

  type ReceitaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReceitaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReceitaCountAggregateInputType | true
    }

  export interface ReceitaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Receita'], meta: { name: 'Receita' } }
    /**
     * Find zero or one Receita that matches the filter.
     * @param {ReceitaFindUniqueArgs} args - Arguments to find a Receita
     * @example
     * // Get one Receita
     * const receita = await prisma.receita.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReceitaFindUniqueArgs>(args: SelectSubset<T, ReceitaFindUniqueArgs<ExtArgs>>): Prisma__ReceitaClient<$Result.GetResult<Prisma.$ReceitaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Receita that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReceitaFindUniqueOrThrowArgs} args - Arguments to find a Receita
     * @example
     * // Get one Receita
     * const receita = await prisma.receita.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReceitaFindUniqueOrThrowArgs>(args: SelectSubset<T, ReceitaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReceitaClient<$Result.GetResult<Prisma.$ReceitaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Receita that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceitaFindFirstArgs} args - Arguments to find a Receita
     * @example
     * // Get one Receita
     * const receita = await prisma.receita.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReceitaFindFirstArgs>(args?: SelectSubset<T, ReceitaFindFirstArgs<ExtArgs>>): Prisma__ReceitaClient<$Result.GetResult<Prisma.$ReceitaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Receita that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceitaFindFirstOrThrowArgs} args - Arguments to find a Receita
     * @example
     * // Get one Receita
     * const receita = await prisma.receita.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReceitaFindFirstOrThrowArgs>(args?: SelectSubset<T, ReceitaFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReceitaClient<$Result.GetResult<Prisma.$ReceitaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Receitas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceitaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Receitas
     * const receitas = await prisma.receita.findMany()
     * 
     * // Get first 10 Receitas
     * const receitas = await prisma.receita.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const receitaWithIdOnly = await prisma.receita.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReceitaFindManyArgs>(args?: SelectSubset<T, ReceitaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceitaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Receita.
     * @param {ReceitaCreateArgs} args - Arguments to create a Receita.
     * @example
     * // Create one Receita
     * const Receita = await prisma.receita.create({
     *   data: {
     *     // ... data to create a Receita
     *   }
     * })
     * 
     */
    create<T extends ReceitaCreateArgs>(args: SelectSubset<T, ReceitaCreateArgs<ExtArgs>>): Prisma__ReceitaClient<$Result.GetResult<Prisma.$ReceitaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Receitas.
     * @param {ReceitaCreateManyArgs} args - Arguments to create many Receitas.
     * @example
     * // Create many Receitas
     * const receita = await prisma.receita.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReceitaCreateManyArgs>(args?: SelectSubset<T, ReceitaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Receitas and returns the data saved in the database.
     * @param {ReceitaCreateManyAndReturnArgs} args - Arguments to create many Receitas.
     * @example
     * // Create many Receitas
     * const receita = await prisma.receita.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Receitas and only return the `id`
     * const receitaWithIdOnly = await prisma.receita.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReceitaCreateManyAndReturnArgs>(args?: SelectSubset<T, ReceitaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceitaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Receita.
     * @param {ReceitaDeleteArgs} args - Arguments to delete one Receita.
     * @example
     * // Delete one Receita
     * const Receita = await prisma.receita.delete({
     *   where: {
     *     // ... filter to delete one Receita
     *   }
     * })
     * 
     */
    delete<T extends ReceitaDeleteArgs>(args: SelectSubset<T, ReceitaDeleteArgs<ExtArgs>>): Prisma__ReceitaClient<$Result.GetResult<Prisma.$ReceitaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Receita.
     * @param {ReceitaUpdateArgs} args - Arguments to update one Receita.
     * @example
     * // Update one Receita
     * const receita = await prisma.receita.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReceitaUpdateArgs>(args: SelectSubset<T, ReceitaUpdateArgs<ExtArgs>>): Prisma__ReceitaClient<$Result.GetResult<Prisma.$ReceitaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Receitas.
     * @param {ReceitaDeleteManyArgs} args - Arguments to filter Receitas to delete.
     * @example
     * // Delete a few Receitas
     * const { count } = await prisma.receita.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReceitaDeleteManyArgs>(args?: SelectSubset<T, ReceitaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Receitas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceitaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Receitas
     * const receita = await prisma.receita.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReceitaUpdateManyArgs>(args: SelectSubset<T, ReceitaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Receitas and returns the data updated in the database.
     * @param {ReceitaUpdateManyAndReturnArgs} args - Arguments to update many Receitas.
     * @example
     * // Update many Receitas
     * const receita = await prisma.receita.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Receitas and only return the `id`
     * const receitaWithIdOnly = await prisma.receita.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReceitaUpdateManyAndReturnArgs>(args: SelectSubset<T, ReceitaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceitaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Receita.
     * @param {ReceitaUpsertArgs} args - Arguments to update or create a Receita.
     * @example
     * // Update or create a Receita
     * const receita = await prisma.receita.upsert({
     *   create: {
     *     // ... data to create a Receita
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Receita we want to update
     *   }
     * })
     */
    upsert<T extends ReceitaUpsertArgs>(args: SelectSubset<T, ReceitaUpsertArgs<ExtArgs>>): Prisma__ReceitaClient<$Result.GetResult<Prisma.$ReceitaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Receitas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceitaCountArgs} args - Arguments to filter Receitas to count.
     * @example
     * // Count the number of Receitas
     * const count = await prisma.receita.count({
     *   where: {
     *     // ... the filter for the Receitas we want to count
     *   }
     * })
    **/
    count<T extends ReceitaCountArgs>(
      args?: Subset<T, ReceitaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReceitaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Receita.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceitaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReceitaAggregateArgs>(args: Subset<T, ReceitaAggregateArgs>): Prisma.PrismaPromise<GetReceitaAggregateType<T>>

    /**
     * Group by Receita.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceitaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReceitaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReceitaGroupByArgs['orderBy'] }
        : { orderBy?: ReceitaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReceitaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReceitaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Receita model
   */
  readonly fields: ReceitaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Receita.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReceitaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    ingredientes<T extends Receita$ingredientesArgs<ExtArgs> = {}>(args?: Subset<T, Receita$ingredientesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IngredientePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    passos<T extends Receita$passosArgs<ExtArgs> = {}>(args?: Subset<T, Receita$passosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PassoReceitaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    usuario<T extends UsuarioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioDefaultArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    favoritos<T extends Receita$favoritosArgs<ExtArgs> = {}>(args?: Subset<T, Receita$favoritosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceitaFavoritaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Receita model
   */
  interface ReceitaFieldRefs {
    readonly id: FieldRef<"Receita", 'String'>
    readonly nome: FieldRef<"Receita", 'String'>
    readonly descricao: FieldRef<"Receita", 'String'>
    readonly categorias: FieldRef<"Receita", 'String[]'>
    readonly tags: FieldRef<"Receita", 'String[]'>
    readonly tempoPreparo: FieldRef<"Receita", 'Int'>
    readonly porcoes: FieldRef<"Receita", 'Int'>
    readonly calorias: FieldRef<"Receita", 'String'>
    readonly imagem: FieldRef<"Receita", 'String'>
    readonly usuarioId: FieldRef<"Receita", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Receita findUnique
   */
  export type ReceitaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receita
     */
    select?: ReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receita
     */
    omit?: ReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaInclude<ExtArgs> | null
    /**
     * Filter, which Receita to fetch.
     */
    where: ReceitaWhereUniqueInput
  }

  /**
   * Receita findUniqueOrThrow
   */
  export type ReceitaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receita
     */
    select?: ReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receita
     */
    omit?: ReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaInclude<ExtArgs> | null
    /**
     * Filter, which Receita to fetch.
     */
    where: ReceitaWhereUniqueInput
  }

  /**
   * Receita findFirst
   */
  export type ReceitaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receita
     */
    select?: ReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receita
     */
    omit?: ReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaInclude<ExtArgs> | null
    /**
     * Filter, which Receita to fetch.
     */
    where?: ReceitaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Receitas to fetch.
     */
    orderBy?: ReceitaOrderByWithRelationInput | ReceitaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Receitas.
     */
    cursor?: ReceitaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Receitas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Receitas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Receitas.
     */
    distinct?: ReceitaScalarFieldEnum | ReceitaScalarFieldEnum[]
  }

  /**
   * Receita findFirstOrThrow
   */
  export type ReceitaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receita
     */
    select?: ReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receita
     */
    omit?: ReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaInclude<ExtArgs> | null
    /**
     * Filter, which Receita to fetch.
     */
    where?: ReceitaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Receitas to fetch.
     */
    orderBy?: ReceitaOrderByWithRelationInput | ReceitaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Receitas.
     */
    cursor?: ReceitaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Receitas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Receitas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Receitas.
     */
    distinct?: ReceitaScalarFieldEnum | ReceitaScalarFieldEnum[]
  }

  /**
   * Receita findMany
   */
  export type ReceitaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receita
     */
    select?: ReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receita
     */
    omit?: ReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaInclude<ExtArgs> | null
    /**
     * Filter, which Receitas to fetch.
     */
    where?: ReceitaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Receitas to fetch.
     */
    orderBy?: ReceitaOrderByWithRelationInput | ReceitaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Receitas.
     */
    cursor?: ReceitaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Receitas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Receitas.
     */
    skip?: number
    distinct?: ReceitaScalarFieldEnum | ReceitaScalarFieldEnum[]
  }

  /**
   * Receita create
   */
  export type ReceitaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receita
     */
    select?: ReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receita
     */
    omit?: ReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaInclude<ExtArgs> | null
    /**
     * The data needed to create a Receita.
     */
    data: XOR<ReceitaCreateInput, ReceitaUncheckedCreateInput>
  }

  /**
   * Receita createMany
   */
  export type ReceitaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Receitas.
     */
    data: ReceitaCreateManyInput | ReceitaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Receita createManyAndReturn
   */
  export type ReceitaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receita
     */
    select?: ReceitaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Receita
     */
    omit?: ReceitaOmit<ExtArgs> | null
    /**
     * The data used to create many Receitas.
     */
    data: ReceitaCreateManyInput | ReceitaCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Receita update
   */
  export type ReceitaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receita
     */
    select?: ReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receita
     */
    omit?: ReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaInclude<ExtArgs> | null
    /**
     * The data needed to update a Receita.
     */
    data: XOR<ReceitaUpdateInput, ReceitaUncheckedUpdateInput>
    /**
     * Choose, which Receita to update.
     */
    where: ReceitaWhereUniqueInput
  }

  /**
   * Receita updateMany
   */
  export type ReceitaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Receitas.
     */
    data: XOR<ReceitaUpdateManyMutationInput, ReceitaUncheckedUpdateManyInput>
    /**
     * Filter which Receitas to update
     */
    where?: ReceitaWhereInput
    /**
     * Limit how many Receitas to update.
     */
    limit?: number
  }

  /**
   * Receita updateManyAndReturn
   */
  export type ReceitaUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receita
     */
    select?: ReceitaSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Receita
     */
    omit?: ReceitaOmit<ExtArgs> | null
    /**
     * The data used to update Receitas.
     */
    data: XOR<ReceitaUpdateManyMutationInput, ReceitaUncheckedUpdateManyInput>
    /**
     * Filter which Receitas to update
     */
    where?: ReceitaWhereInput
    /**
     * Limit how many Receitas to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Receita upsert
   */
  export type ReceitaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receita
     */
    select?: ReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receita
     */
    omit?: ReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaInclude<ExtArgs> | null
    /**
     * The filter to search for the Receita to update in case it exists.
     */
    where: ReceitaWhereUniqueInput
    /**
     * In case the Receita found by the `where` argument doesn't exist, create a new Receita with this data.
     */
    create: XOR<ReceitaCreateInput, ReceitaUncheckedCreateInput>
    /**
     * In case the Receita was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReceitaUpdateInput, ReceitaUncheckedUpdateInput>
  }

  /**
   * Receita delete
   */
  export type ReceitaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receita
     */
    select?: ReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receita
     */
    omit?: ReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaInclude<ExtArgs> | null
    /**
     * Filter which Receita to delete.
     */
    where: ReceitaWhereUniqueInput
  }

  /**
   * Receita deleteMany
   */
  export type ReceitaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Receitas to delete
     */
    where?: ReceitaWhereInput
    /**
     * Limit how many Receitas to delete.
     */
    limit?: number
  }

  /**
   * Receita.ingredientes
   */
  export type Receita$ingredientesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingrediente
     */
    select?: IngredienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingrediente
     */
    omit?: IngredienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredienteInclude<ExtArgs> | null
    where?: IngredienteWhereInput
    orderBy?: IngredienteOrderByWithRelationInput | IngredienteOrderByWithRelationInput[]
    cursor?: IngredienteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: IngredienteScalarFieldEnum | IngredienteScalarFieldEnum[]
  }

  /**
   * Receita.passos
   */
  export type Receita$passosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PassoReceita
     */
    select?: PassoReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PassoReceita
     */
    omit?: PassoReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassoReceitaInclude<ExtArgs> | null
    where?: PassoReceitaWhereInput
    orderBy?: PassoReceitaOrderByWithRelationInput | PassoReceitaOrderByWithRelationInput[]
    cursor?: PassoReceitaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PassoReceitaScalarFieldEnum | PassoReceitaScalarFieldEnum[]
  }

  /**
   * Receita.favoritos
   */
  export type Receita$favoritosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceitaFavorita
     */
    select?: ReceitaFavoritaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceitaFavorita
     */
    omit?: ReceitaFavoritaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaFavoritaInclude<ExtArgs> | null
    where?: ReceitaFavoritaWhereInput
    orderBy?: ReceitaFavoritaOrderByWithRelationInput | ReceitaFavoritaOrderByWithRelationInput[]
    cursor?: ReceitaFavoritaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReceitaFavoritaScalarFieldEnum | ReceitaFavoritaScalarFieldEnum[]
  }

  /**
   * Receita without action
   */
  export type ReceitaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Receita
     */
    select?: ReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Receita
     */
    omit?: ReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaInclude<ExtArgs> | null
  }


  /**
   * Model Ingrediente
   */

  export type AggregateIngrediente = {
    _count: IngredienteCountAggregateOutputType | null
    _avg: IngredienteAvgAggregateOutputType | null
    _sum: IngredienteSumAggregateOutputType | null
    _min: IngredienteMinAggregateOutputType | null
    _max: IngredienteMaxAggregateOutputType | null
  }

  export type IngredienteAvgAggregateOutputType = {
    quantidade: number | null
  }

  export type IngredienteSumAggregateOutputType = {
    quantidade: number | null
  }

  export type IngredienteMinAggregateOutputType = {
    id: string | null
    nome: string | null
    quantidade: number | null
    unidade: string | null
    receitaId: string | null
  }

  export type IngredienteMaxAggregateOutputType = {
    id: string | null
    nome: string | null
    quantidade: number | null
    unidade: string | null
    receitaId: string | null
  }

  export type IngredienteCountAggregateOutputType = {
    id: number
    nome: number
    quantidade: number
    unidade: number
    receitaId: number
    _all: number
  }


  export type IngredienteAvgAggregateInputType = {
    quantidade?: true
  }

  export type IngredienteSumAggregateInputType = {
    quantidade?: true
  }

  export type IngredienteMinAggregateInputType = {
    id?: true
    nome?: true
    quantidade?: true
    unidade?: true
    receitaId?: true
  }

  export type IngredienteMaxAggregateInputType = {
    id?: true
    nome?: true
    quantidade?: true
    unidade?: true
    receitaId?: true
  }

  export type IngredienteCountAggregateInputType = {
    id?: true
    nome?: true
    quantidade?: true
    unidade?: true
    receitaId?: true
    _all?: true
  }

  export type IngredienteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Ingrediente to aggregate.
     */
    where?: IngredienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ingredientes to fetch.
     */
    orderBy?: IngredienteOrderByWithRelationInput | IngredienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IngredienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ingredientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ingredientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Ingredientes
    **/
    _count?: true | IngredienteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: IngredienteAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: IngredienteSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IngredienteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IngredienteMaxAggregateInputType
  }

  export type GetIngredienteAggregateType<T extends IngredienteAggregateArgs> = {
        [P in keyof T & keyof AggregateIngrediente]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIngrediente[P]>
      : GetScalarType<T[P], AggregateIngrediente[P]>
  }




  export type IngredienteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IngredienteWhereInput
    orderBy?: IngredienteOrderByWithAggregationInput | IngredienteOrderByWithAggregationInput[]
    by: IngredienteScalarFieldEnum[] | IngredienteScalarFieldEnum
    having?: IngredienteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IngredienteCountAggregateInputType | true
    _avg?: IngredienteAvgAggregateInputType
    _sum?: IngredienteSumAggregateInputType
    _min?: IngredienteMinAggregateInputType
    _max?: IngredienteMaxAggregateInputType
  }

  export type IngredienteGroupByOutputType = {
    id: string
    nome: string
    quantidade: number
    unidade: string
    receitaId: string
    _count: IngredienteCountAggregateOutputType | null
    _avg: IngredienteAvgAggregateOutputType | null
    _sum: IngredienteSumAggregateOutputType | null
    _min: IngredienteMinAggregateOutputType | null
    _max: IngredienteMaxAggregateOutputType | null
  }

  type GetIngredienteGroupByPayload<T extends IngredienteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IngredienteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IngredienteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IngredienteGroupByOutputType[P]>
            : GetScalarType<T[P], IngredienteGroupByOutputType[P]>
        }
      >
    >


  export type IngredienteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    quantidade?: boolean
    unidade?: boolean
    receitaId?: boolean
    receita?: boolean | ReceitaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ingrediente"]>

  export type IngredienteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    quantidade?: boolean
    unidade?: boolean
    receitaId?: boolean
    receita?: boolean | ReceitaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ingrediente"]>

  export type IngredienteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    quantidade?: boolean
    unidade?: boolean
    receitaId?: boolean
    receita?: boolean | ReceitaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ingrediente"]>

  export type IngredienteSelectScalar = {
    id?: boolean
    nome?: boolean
    quantidade?: boolean
    unidade?: boolean
    receitaId?: boolean
  }

  export type IngredienteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nome" | "quantidade" | "unidade" | "receitaId", ExtArgs["result"]["ingrediente"]>
  export type IngredienteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receita?: boolean | ReceitaDefaultArgs<ExtArgs>
  }
  export type IngredienteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receita?: boolean | ReceitaDefaultArgs<ExtArgs>
  }
  export type IngredienteIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receita?: boolean | ReceitaDefaultArgs<ExtArgs>
  }

  export type $IngredientePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Ingrediente"
    objects: {
      receita: Prisma.$ReceitaPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nome: string
      quantidade: number
      unidade: string
      receitaId: string
    }, ExtArgs["result"]["ingrediente"]>
    composites: {}
  }

  type IngredienteGetPayload<S extends boolean | null | undefined | IngredienteDefaultArgs> = $Result.GetResult<Prisma.$IngredientePayload, S>

  type IngredienteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<IngredienteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: IngredienteCountAggregateInputType | true
    }

  export interface IngredienteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Ingrediente'], meta: { name: 'Ingrediente' } }
    /**
     * Find zero or one Ingrediente that matches the filter.
     * @param {IngredienteFindUniqueArgs} args - Arguments to find a Ingrediente
     * @example
     * // Get one Ingrediente
     * const ingrediente = await prisma.ingrediente.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IngredienteFindUniqueArgs>(args: SelectSubset<T, IngredienteFindUniqueArgs<ExtArgs>>): Prisma__IngredienteClient<$Result.GetResult<Prisma.$IngredientePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ingrediente that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {IngredienteFindUniqueOrThrowArgs} args - Arguments to find a Ingrediente
     * @example
     * // Get one Ingrediente
     * const ingrediente = await prisma.ingrediente.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IngredienteFindUniqueOrThrowArgs>(args: SelectSubset<T, IngredienteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IngredienteClient<$Result.GetResult<Prisma.$IngredientePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ingrediente that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredienteFindFirstArgs} args - Arguments to find a Ingrediente
     * @example
     * // Get one Ingrediente
     * const ingrediente = await prisma.ingrediente.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IngredienteFindFirstArgs>(args?: SelectSubset<T, IngredienteFindFirstArgs<ExtArgs>>): Prisma__IngredienteClient<$Result.GetResult<Prisma.$IngredientePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ingrediente that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredienteFindFirstOrThrowArgs} args - Arguments to find a Ingrediente
     * @example
     * // Get one Ingrediente
     * const ingrediente = await prisma.ingrediente.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IngredienteFindFirstOrThrowArgs>(args?: SelectSubset<T, IngredienteFindFirstOrThrowArgs<ExtArgs>>): Prisma__IngredienteClient<$Result.GetResult<Prisma.$IngredientePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ingredientes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredienteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ingredientes
     * const ingredientes = await prisma.ingrediente.findMany()
     * 
     * // Get first 10 Ingredientes
     * const ingredientes = await prisma.ingrediente.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ingredienteWithIdOnly = await prisma.ingrediente.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IngredienteFindManyArgs>(args?: SelectSubset<T, IngredienteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IngredientePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ingrediente.
     * @param {IngredienteCreateArgs} args - Arguments to create a Ingrediente.
     * @example
     * // Create one Ingrediente
     * const Ingrediente = await prisma.ingrediente.create({
     *   data: {
     *     // ... data to create a Ingrediente
     *   }
     * })
     * 
     */
    create<T extends IngredienteCreateArgs>(args: SelectSubset<T, IngredienteCreateArgs<ExtArgs>>): Prisma__IngredienteClient<$Result.GetResult<Prisma.$IngredientePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ingredientes.
     * @param {IngredienteCreateManyArgs} args - Arguments to create many Ingredientes.
     * @example
     * // Create many Ingredientes
     * const ingrediente = await prisma.ingrediente.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IngredienteCreateManyArgs>(args?: SelectSubset<T, IngredienteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Ingredientes and returns the data saved in the database.
     * @param {IngredienteCreateManyAndReturnArgs} args - Arguments to create many Ingredientes.
     * @example
     * // Create many Ingredientes
     * const ingrediente = await prisma.ingrediente.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Ingredientes and only return the `id`
     * const ingredienteWithIdOnly = await prisma.ingrediente.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IngredienteCreateManyAndReturnArgs>(args?: SelectSubset<T, IngredienteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IngredientePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Ingrediente.
     * @param {IngredienteDeleteArgs} args - Arguments to delete one Ingrediente.
     * @example
     * // Delete one Ingrediente
     * const Ingrediente = await prisma.ingrediente.delete({
     *   where: {
     *     // ... filter to delete one Ingrediente
     *   }
     * })
     * 
     */
    delete<T extends IngredienteDeleteArgs>(args: SelectSubset<T, IngredienteDeleteArgs<ExtArgs>>): Prisma__IngredienteClient<$Result.GetResult<Prisma.$IngredientePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ingrediente.
     * @param {IngredienteUpdateArgs} args - Arguments to update one Ingrediente.
     * @example
     * // Update one Ingrediente
     * const ingrediente = await prisma.ingrediente.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IngredienteUpdateArgs>(args: SelectSubset<T, IngredienteUpdateArgs<ExtArgs>>): Prisma__IngredienteClient<$Result.GetResult<Prisma.$IngredientePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ingredientes.
     * @param {IngredienteDeleteManyArgs} args - Arguments to filter Ingredientes to delete.
     * @example
     * // Delete a few Ingredientes
     * const { count } = await prisma.ingrediente.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IngredienteDeleteManyArgs>(args?: SelectSubset<T, IngredienteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ingredientes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredienteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ingredientes
     * const ingrediente = await prisma.ingrediente.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IngredienteUpdateManyArgs>(args: SelectSubset<T, IngredienteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ingredientes and returns the data updated in the database.
     * @param {IngredienteUpdateManyAndReturnArgs} args - Arguments to update many Ingredientes.
     * @example
     * // Update many Ingredientes
     * const ingrediente = await prisma.ingrediente.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Ingredientes and only return the `id`
     * const ingredienteWithIdOnly = await prisma.ingrediente.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends IngredienteUpdateManyAndReturnArgs>(args: SelectSubset<T, IngredienteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IngredientePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Ingrediente.
     * @param {IngredienteUpsertArgs} args - Arguments to update or create a Ingrediente.
     * @example
     * // Update or create a Ingrediente
     * const ingrediente = await prisma.ingrediente.upsert({
     *   create: {
     *     // ... data to create a Ingrediente
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ingrediente we want to update
     *   }
     * })
     */
    upsert<T extends IngredienteUpsertArgs>(args: SelectSubset<T, IngredienteUpsertArgs<ExtArgs>>): Prisma__IngredienteClient<$Result.GetResult<Prisma.$IngredientePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ingredientes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredienteCountArgs} args - Arguments to filter Ingredientes to count.
     * @example
     * // Count the number of Ingredientes
     * const count = await prisma.ingrediente.count({
     *   where: {
     *     // ... the filter for the Ingredientes we want to count
     *   }
     * })
    **/
    count<T extends IngredienteCountArgs>(
      args?: Subset<T, IngredienteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IngredienteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ingrediente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredienteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends IngredienteAggregateArgs>(args: Subset<T, IngredienteAggregateArgs>): Prisma.PrismaPromise<GetIngredienteAggregateType<T>>

    /**
     * Group by Ingrediente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredienteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends IngredienteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IngredienteGroupByArgs['orderBy'] }
        : { orderBy?: IngredienteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, IngredienteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIngredienteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Ingrediente model
   */
  readonly fields: IngredienteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Ingrediente.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IngredienteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    receita<T extends ReceitaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReceitaDefaultArgs<ExtArgs>>): Prisma__ReceitaClient<$Result.GetResult<Prisma.$ReceitaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Ingrediente model
   */
  interface IngredienteFieldRefs {
    readonly id: FieldRef<"Ingrediente", 'String'>
    readonly nome: FieldRef<"Ingrediente", 'String'>
    readonly quantidade: FieldRef<"Ingrediente", 'Float'>
    readonly unidade: FieldRef<"Ingrediente", 'String'>
    readonly receitaId: FieldRef<"Ingrediente", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Ingrediente findUnique
   */
  export type IngredienteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingrediente
     */
    select?: IngredienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingrediente
     */
    omit?: IngredienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredienteInclude<ExtArgs> | null
    /**
     * Filter, which Ingrediente to fetch.
     */
    where: IngredienteWhereUniqueInput
  }

  /**
   * Ingrediente findUniqueOrThrow
   */
  export type IngredienteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingrediente
     */
    select?: IngredienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingrediente
     */
    omit?: IngredienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredienteInclude<ExtArgs> | null
    /**
     * Filter, which Ingrediente to fetch.
     */
    where: IngredienteWhereUniqueInput
  }

  /**
   * Ingrediente findFirst
   */
  export type IngredienteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingrediente
     */
    select?: IngredienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingrediente
     */
    omit?: IngredienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredienteInclude<ExtArgs> | null
    /**
     * Filter, which Ingrediente to fetch.
     */
    where?: IngredienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ingredientes to fetch.
     */
    orderBy?: IngredienteOrderByWithRelationInput | IngredienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Ingredientes.
     */
    cursor?: IngredienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ingredientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ingredientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Ingredientes.
     */
    distinct?: IngredienteScalarFieldEnum | IngredienteScalarFieldEnum[]
  }

  /**
   * Ingrediente findFirstOrThrow
   */
  export type IngredienteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingrediente
     */
    select?: IngredienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingrediente
     */
    omit?: IngredienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredienteInclude<ExtArgs> | null
    /**
     * Filter, which Ingrediente to fetch.
     */
    where?: IngredienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ingredientes to fetch.
     */
    orderBy?: IngredienteOrderByWithRelationInput | IngredienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Ingredientes.
     */
    cursor?: IngredienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ingredientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ingredientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Ingredientes.
     */
    distinct?: IngredienteScalarFieldEnum | IngredienteScalarFieldEnum[]
  }

  /**
   * Ingrediente findMany
   */
  export type IngredienteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingrediente
     */
    select?: IngredienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingrediente
     */
    omit?: IngredienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredienteInclude<ExtArgs> | null
    /**
     * Filter, which Ingredientes to fetch.
     */
    where?: IngredienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ingredientes to fetch.
     */
    orderBy?: IngredienteOrderByWithRelationInput | IngredienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Ingredientes.
     */
    cursor?: IngredienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ingredientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ingredientes.
     */
    skip?: number
    distinct?: IngredienteScalarFieldEnum | IngredienteScalarFieldEnum[]
  }

  /**
   * Ingrediente create
   */
  export type IngredienteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingrediente
     */
    select?: IngredienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingrediente
     */
    omit?: IngredienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredienteInclude<ExtArgs> | null
    /**
     * The data needed to create a Ingrediente.
     */
    data: XOR<IngredienteCreateInput, IngredienteUncheckedCreateInput>
  }

  /**
   * Ingrediente createMany
   */
  export type IngredienteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Ingredientes.
     */
    data: IngredienteCreateManyInput | IngredienteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Ingrediente createManyAndReturn
   */
  export type IngredienteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingrediente
     */
    select?: IngredienteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Ingrediente
     */
    omit?: IngredienteOmit<ExtArgs> | null
    /**
     * The data used to create many Ingredientes.
     */
    data: IngredienteCreateManyInput | IngredienteCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredienteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Ingrediente update
   */
  export type IngredienteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingrediente
     */
    select?: IngredienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingrediente
     */
    omit?: IngredienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredienteInclude<ExtArgs> | null
    /**
     * The data needed to update a Ingrediente.
     */
    data: XOR<IngredienteUpdateInput, IngredienteUncheckedUpdateInput>
    /**
     * Choose, which Ingrediente to update.
     */
    where: IngredienteWhereUniqueInput
  }

  /**
   * Ingrediente updateMany
   */
  export type IngredienteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Ingredientes.
     */
    data: XOR<IngredienteUpdateManyMutationInput, IngredienteUncheckedUpdateManyInput>
    /**
     * Filter which Ingredientes to update
     */
    where?: IngredienteWhereInput
    /**
     * Limit how many Ingredientes to update.
     */
    limit?: number
  }

  /**
   * Ingrediente updateManyAndReturn
   */
  export type IngredienteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingrediente
     */
    select?: IngredienteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Ingrediente
     */
    omit?: IngredienteOmit<ExtArgs> | null
    /**
     * The data used to update Ingredientes.
     */
    data: XOR<IngredienteUpdateManyMutationInput, IngredienteUncheckedUpdateManyInput>
    /**
     * Filter which Ingredientes to update
     */
    where?: IngredienteWhereInput
    /**
     * Limit how many Ingredientes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredienteIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Ingrediente upsert
   */
  export type IngredienteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingrediente
     */
    select?: IngredienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingrediente
     */
    omit?: IngredienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredienteInclude<ExtArgs> | null
    /**
     * The filter to search for the Ingrediente to update in case it exists.
     */
    where: IngredienteWhereUniqueInput
    /**
     * In case the Ingrediente found by the `where` argument doesn't exist, create a new Ingrediente with this data.
     */
    create: XOR<IngredienteCreateInput, IngredienteUncheckedCreateInput>
    /**
     * In case the Ingrediente was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IngredienteUpdateInput, IngredienteUncheckedUpdateInput>
  }

  /**
   * Ingrediente delete
   */
  export type IngredienteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingrediente
     */
    select?: IngredienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingrediente
     */
    omit?: IngredienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredienteInclude<ExtArgs> | null
    /**
     * Filter which Ingrediente to delete.
     */
    where: IngredienteWhereUniqueInput
  }

  /**
   * Ingrediente deleteMany
   */
  export type IngredienteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Ingredientes to delete
     */
    where?: IngredienteWhereInput
    /**
     * Limit how many Ingredientes to delete.
     */
    limit?: number
  }

  /**
   * Ingrediente without action
   */
  export type IngredienteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingrediente
     */
    select?: IngredienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingrediente
     */
    omit?: IngredienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredienteInclude<ExtArgs> | null
  }


  /**
   * Model PassoReceita
   */

  export type AggregatePassoReceita = {
    _count: PassoReceitaCountAggregateOutputType | null
    _avg: PassoReceitaAvgAggregateOutputType | null
    _sum: PassoReceitaSumAggregateOutputType | null
    _min: PassoReceitaMinAggregateOutputType | null
    _max: PassoReceitaMaxAggregateOutputType | null
  }

  export type PassoReceitaAvgAggregateOutputType = {
    ordem: number | null
  }

  export type PassoReceitaSumAggregateOutputType = {
    ordem: number | null
  }

  export type PassoReceitaMinAggregateOutputType = {
    id: string | null
    ordem: number | null
    descricao: string | null
    receitaId: string | null
  }

  export type PassoReceitaMaxAggregateOutputType = {
    id: string | null
    ordem: number | null
    descricao: string | null
    receitaId: string | null
  }

  export type PassoReceitaCountAggregateOutputType = {
    id: number
    ordem: number
    descricao: number
    receitaId: number
    _all: number
  }


  export type PassoReceitaAvgAggregateInputType = {
    ordem?: true
  }

  export type PassoReceitaSumAggregateInputType = {
    ordem?: true
  }

  export type PassoReceitaMinAggregateInputType = {
    id?: true
    ordem?: true
    descricao?: true
    receitaId?: true
  }

  export type PassoReceitaMaxAggregateInputType = {
    id?: true
    ordem?: true
    descricao?: true
    receitaId?: true
  }

  export type PassoReceitaCountAggregateInputType = {
    id?: true
    ordem?: true
    descricao?: true
    receitaId?: true
    _all?: true
  }

  export type PassoReceitaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PassoReceita to aggregate.
     */
    where?: PassoReceitaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PassoReceitas to fetch.
     */
    orderBy?: PassoReceitaOrderByWithRelationInput | PassoReceitaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PassoReceitaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PassoReceitas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PassoReceitas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PassoReceitas
    **/
    _count?: true | PassoReceitaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PassoReceitaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PassoReceitaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PassoReceitaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PassoReceitaMaxAggregateInputType
  }

  export type GetPassoReceitaAggregateType<T extends PassoReceitaAggregateArgs> = {
        [P in keyof T & keyof AggregatePassoReceita]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePassoReceita[P]>
      : GetScalarType<T[P], AggregatePassoReceita[P]>
  }




  export type PassoReceitaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PassoReceitaWhereInput
    orderBy?: PassoReceitaOrderByWithAggregationInput | PassoReceitaOrderByWithAggregationInput[]
    by: PassoReceitaScalarFieldEnum[] | PassoReceitaScalarFieldEnum
    having?: PassoReceitaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PassoReceitaCountAggregateInputType | true
    _avg?: PassoReceitaAvgAggregateInputType
    _sum?: PassoReceitaSumAggregateInputType
    _min?: PassoReceitaMinAggregateInputType
    _max?: PassoReceitaMaxAggregateInputType
  }

  export type PassoReceitaGroupByOutputType = {
    id: string
    ordem: number
    descricao: string
    receitaId: string
    _count: PassoReceitaCountAggregateOutputType | null
    _avg: PassoReceitaAvgAggregateOutputType | null
    _sum: PassoReceitaSumAggregateOutputType | null
    _min: PassoReceitaMinAggregateOutputType | null
    _max: PassoReceitaMaxAggregateOutputType | null
  }

  type GetPassoReceitaGroupByPayload<T extends PassoReceitaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PassoReceitaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PassoReceitaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PassoReceitaGroupByOutputType[P]>
            : GetScalarType<T[P], PassoReceitaGroupByOutputType[P]>
        }
      >
    >


  export type PassoReceitaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ordem?: boolean
    descricao?: boolean
    receitaId?: boolean
    receita?: boolean | ReceitaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["passoReceita"]>

  export type PassoReceitaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ordem?: boolean
    descricao?: boolean
    receitaId?: boolean
    receita?: boolean | ReceitaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["passoReceita"]>

  export type PassoReceitaSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ordem?: boolean
    descricao?: boolean
    receitaId?: boolean
    receita?: boolean | ReceitaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["passoReceita"]>

  export type PassoReceitaSelectScalar = {
    id?: boolean
    ordem?: boolean
    descricao?: boolean
    receitaId?: boolean
  }

  export type PassoReceitaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "ordem" | "descricao" | "receitaId", ExtArgs["result"]["passoReceita"]>
  export type PassoReceitaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receita?: boolean | ReceitaDefaultArgs<ExtArgs>
  }
  export type PassoReceitaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receita?: boolean | ReceitaDefaultArgs<ExtArgs>
  }
  export type PassoReceitaIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receita?: boolean | ReceitaDefaultArgs<ExtArgs>
  }

  export type $PassoReceitaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PassoReceita"
    objects: {
      receita: Prisma.$ReceitaPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      ordem: number
      descricao: string
      receitaId: string
    }, ExtArgs["result"]["passoReceita"]>
    composites: {}
  }

  type PassoReceitaGetPayload<S extends boolean | null | undefined | PassoReceitaDefaultArgs> = $Result.GetResult<Prisma.$PassoReceitaPayload, S>

  type PassoReceitaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PassoReceitaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PassoReceitaCountAggregateInputType | true
    }

  export interface PassoReceitaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PassoReceita'], meta: { name: 'PassoReceita' } }
    /**
     * Find zero or one PassoReceita that matches the filter.
     * @param {PassoReceitaFindUniqueArgs} args - Arguments to find a PassoReceita
     * @example
     * // Get one PassoReceita
     * const passoReceita = await prisma.passoReceita.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PassoReceitaFindUniqueArgs>(args: SelectSubset<T, PassoReceitaFindUniqueArgs<ExtArgs>>): Prisma__PassoReceitaClient<$Result.GetResult<Prisma.$PassoReceitaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PassoReceita that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PassoReceitaFindUniqueOrThrowArgs} args - Arguments to find a PassoReceita
     * @example
     * // Get one PassoReceita
     * const passoReceita = await prisma.passoReceita.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PassoReceitaFindUniqueOrThrowArgs>(args: SelectSubset<T, PassoReceitaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PassoReceitaClient<$Result.GetResult<Prisma.$PassoReceitaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PassoReceita that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassoReceitaFindFirstArgs} args - Arguments to find a PassoReceita
     * @example
     * // Get one PassoReceita
     * const passoReceita = await prisma.passoReceita.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PassoReceitaFindFirstArgs>(args?: SelectSubset<T, PassoReceitaFindFirstArgs<ExtArgs>>): Prisma__PassoReceitaClient<$Result.GetResult<Prisma.$PassoReceitaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PassoReceita that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassoReceitaFindFirstOrThrowArgs} args - Arguments to find a PassoReceita
     * @example
     * // Get one PassoReceita
     * const passoReceita = await prisma.passoReceita.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PassoReceitaFindFirstOrThrowArgs>(args?: SelectSubset<T, PassoReceitaFindFirstOrThrowArgs<ExtArgs>>): Prisma__PassoReceitaClient<$Result.GetResult<Prisma.$PassoReceitaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PassoReceitas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassoReceitaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PassoReceitas
     * const passoReceitas = await prisma.passoReceita.findMany()
     * 
     * // Get first 10 PassoReceitas
     * const passoReceitas = await prisma.passoReceita.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const passoReceitaWithIdOnly = await prisma.passoReceita.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PassoReceitaFindManyArgs>(args?: SelectSubset<T, PassoReceitaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PassoReceitaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PassoReceita.
     * @param {PassoReceitaCreateArgs} args - Arguments to create a PassoReceita.
     * @example
     * // Create one PassoReceita
     * const PassoReceita = await prisma.passoReceita.create({
     *   data: {
     *     // ... data to create a PassoReceita
     *   }
     * })
     * 
     */
    create<T extends PassoReceitaCreateArgs>(args: SelectSubset<T, PassoReceitaCreateArgs<ExtArgs>>): Prisma__PassoReceitaClient<$Result.GetResult<Prisma.$PassoReceitaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PassoReceitas.
     * @param {PassoReceitaCreateManyArgs} args - Arguments to create many PassoReceitas.
     * @example
     * // Create many PassoReceitas
     * const passoReceita = await prisma.passoReceita.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PassoReceitaCreateManyArgs>(args?: SelectSubset<T, PassoReceitaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PassoReceitas and returns the data saved in the database.
     * @param {PassoReceitaCreateManyAndReturnArgs} args - Arguments to create many PassoReceitas.
     * @example
     * // Create many PassoReceitas
     * const passoReceita = await prisma.passoReceita.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PassoReceitas and only return the `id`
     * const passoReceitaWithIdOnly = await prisma.passoReceita.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PassoReceitaCreateManyAndReturnArgs>(args?: SelectSubset<T, PassoReceitaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PassoReceitaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PassoReceita.
     * @param {PassoReceitaDeleteArgs} args - Arguments to delete one PassoReceita.
     * @example
     * // Delete one PassoReceita
     * const PassoReceita = await prisma.passoReceita.delete({
     *   where: {
     *     // ... filter to delete one PassoReceita
     *   }
     * })
     * 
     */
    delete<T extends PassoReceitaDeleteArgs>(args: SelectSubset<T, PassoReceitaDeleteArgs<ExtArgs>>): Prisma__PassoReceitaClient<$Result.GetResult<Prisma.$PassoReceitaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PassoReceita.
     * @param {PassoReceitaUpdateArgs} args - Arguments to update one PassoReceita.
     * @example
     * // Update one PassoReceita
     * const passoReceita = await prisma.passoReceita.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PassoReceitaUpdateArgs>(args: SelectSubset<T, PassoReceitaUpdateArgs<ExtArgs>>): Prisma__PassoReceitaClient<$Result.GetResult<Prisma.$PassoReceitaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PassoReceitas.
     * @param {PassoReceitaDeleteManyArgs} args - Arguments to filter PassoReceitas to delete.
     * @example
     * // Delete a few PassoReceitas
     * const { count } = await prisma.passoReceita.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PassoReceitaDeleteManyArgs>(args?: SelectSubset<T, PassoReceitaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PassoReceitas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassoReceitaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PassoReceitas
     * const passoReceita = await prisma.passoReceita.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PassoReceitaUpdateManyArgs>(args: SelectSubset<T, PassoReceitaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PassoReceitas and returns the data updated in the database.
     * @param {PassoReceitaUpdateManyAndReturnArgs} args - Arguments to update many PassoReceitas.
     * @example
     * // Update many PassoReceitas
     * const passoReceita = await prisma.passoReceita.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PassoReceitas and only return the `id`
     * const passoReceitaWithIdOnly = await prisma.passoReceita.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PassoReceitaUpdateManyAndReturnArgs>(args: SelectSubset<T, PassoReceitaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PassoReceitaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PassoReceita.
     * @param {PassoReceitaUpsertArgs} args - Arguments to update or create a PassoReceita.
     * @example
     * // Update or create a PassoReceita
     * const passoReceita = await prisma.passoReceita.upsert({
     *   create: {
     *     // ... data to create a PassoReceita
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PassoReceita we want to update
     *   }
     * })
     */
    upsert<T extends PassoReceitaUpsertArgs>(args: SelectSubset<T, PassoReceitaUpsertArgs<ExtArgs>>): Prisma__PassoReceitaClient<$Result.GetResult<Prisma.$PassoReceitaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PassoReceitas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassoReceitaCountArgs} args - Arguments to filter PassoReceitas to count.
     * @example
     * // Count the number of PassoReceitas
     * const count = await prisma.passoReceita.count({
     *   where: {
     *     // ... the filter for the PassoReceitas we want to count
     *   }
     * })
    **/
    count<T extends PassoReceitaCountArgs>(
      args?: Subset<T, PassoReceitaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PassoReceitaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PassoReceita.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassoReceitaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PassoReceitaAggregateArgs>(args: Subset<T, PassoReceitaAggregateArgs>): Prisma.PrismaPromise<GetPassoReceitaAggregateType<T>>

    /**
     * Group by PassoReceita.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassoReceitaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PassoReceitaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PassoReceitaGroupByArgs['orderBy'] }
        : { orderBy?: PassoReceitaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PassoReceitaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPassoReceitaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PassoReceita model
   */
  readonly fields: PassoReceitaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PassoReceita.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PassoReceitaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    receita<T extends ReceitaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReceitaDefaultArgs<ExtArgs>>): Prisma__ReceitaClient<$Result.GetResult<Prisma.$ReceitaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PassoReceita model
   */
  interface PassoReceitaFieldRefs {
    readonly id: FieldRef<"PassoReceita", 'String'>
    readonly ordem: FieldRef<"PassoReceita", 'Int'>
    readonly descricao: FieldRef<"PassoReceita", 'String'>
    readonly receitaId: FieldRef<"PassoReceita", 'String'>
  }
    

  // Custom InputTypes
  /**
   * PassoReceita findUnique
   */
  export type PassoReceitaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PassoReceita
     */
    select?: PassoReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PassoReceita
     */
    omit?: PassoReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassoReceitaInclude<ExtArgs> | null
    /**
     * Filter, which PassoReceita to fetch.
     */
    where: PassoReceitaWhereUniqueInput
  }

  /**
   * PassoReceita findUniqueOrThrow
   */
  export type PassoReceitaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PassoReceita
     */
    select?: PassoReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PassoReceita
     */
    omit?: PassoReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassoReceitaInclude<ExtArgs> | null
    /**
     * Filter, which PassoReceita to fetch.
     */
    where: PassoReceitaWhereUniqueInput
  }

  /**
   * PassoReceita findFirst
   */
  export type PassoReceitaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PassoReceita
     */
    select?: PassoReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PassoReceita
     */
    omit?: PassoReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassoReceitaInclude<ExtArgs> | null
    /**
     * Filter, which PassoReceita to fetch.
     */
    where?: PassoReceitaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PassoReceitas to fetch.
     */
    orderBy?: PassoReceitaOrderByWithRelationInput | PassoReceitaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PassoReceitas.
     */
    cursor?: PassoReceitaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PassoReceitas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PassoReceitas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PassoReceitas.
     */
    distinct?: PassoReceitaScalarFieldEnum | PassoReceitaScalarFieldEnum[]
  }

  /**
   * PassoReceita findFirstOrThrow
   */
  export type PassoReceitaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PassoReceita
     */
    select?: PassoReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PassoReceita
     */
    omit?: PassoReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassoReceitaInclude<ExtArgs> | null
    /**
     * Filter, which PassoReceita to fetch.
     */
    where?: PassoReceitaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PassoReceitas to fetch.
     */
    orderBy?: PassoReceitaOrderByWithRelationInput | PassoReceitaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PassoReceitas.
     */
    cursor?: PassoReceitaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PassoReceitas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PassoReceitas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PassoReceitas.
     */
    distinct?: PassoReceitaScalarFieldEnum | PassoReceitaScalarFieldEnum[]
  }

  /**
   * PassoReceita findMany
   */
  export type PassoReceitaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PassoReceita
     */
    select?: PassoReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PassoReceita
     */
    omit?: PassoReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassoReceitaInclude<ExtArgs> | null
    /**
     * Filter, which PassoReceitas to fetch.
     */
    where?: PassoReceitaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PassoReceitas to fetch.
     */
    orderBy?: PassoReceitaOrderByWithRelationInput | PassoReceitaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PassoReceitas.
     */
    cursor?: PassoReceitaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PassoReceitas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PassoReceitas.
     */
    skip?: number
    distinct?: PassoReceitaScalarFieldEnum | PassoReceitaScalarFieldEnum[]
  }

  /**
   * PassoReceita create
   */
  export type PassoReceitaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PassoReceita
     */
    select?: PassoReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PassoReceita
     */
    omit?: PassoReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassoReceitaInclude<ExtArgs> | null
    /**
     * The data needed to create a PassoReceita.
     */
    data: XOR<PassoReceitaCreateInput, PassoReceitaUncheckedCreateInput>
  }

  /**
   * PassoReceita createMany
   */
  export type PassoReceitaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PassoReceitas.
     */
    data: PassoReceitaCreateManyInput | PassoReceitaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PassoReceita createManyAndReturn
   */
  export type PassoReceitaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PassoReceita
     */
    select?: PassoReceitaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PassoReceita
     */
    omit?: PassoReceitaOmit<ExtArgs> | null
    /**
     * The data used to create many PassoReceitas.
     */
    data: PassoReceitaCreateManyInput | PassoReceitaCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassoReceitaIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PassoReceita update
   */
  export type PassoReceitaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PassoReceita
     */
    select?: PassoReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PassoReceita
     */
    omit?: PassoReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassoReceitaInclude<ExtArgs> | null
    /**
     * The data needed to update a PassoReceita.
     */
    data: XOR<PassoReceitaUpdateInput, PassoReceitaUncheckedUpdateInput>
    /**
     * Choose, which PassoReceita to update.
     */
    where: PassoReceitaWhereUniqueInput
  }

  /**
   * PassoReceita updateMany
   */
  export type PassoReceitaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PassoReceitas.
     */
    data: XOR<PassoReceitaUpdateManyMutationInput, PassoReceitaUncheckedUpdateManyInput>
    /**
     * Filter which PassoReceitas to update
     */
    where?: PassoReceitaWhereInput
    /**
     * Limit how many PassoReceitas to update.
     */
    limit?: number
  }

  /**
   * PassoReceita updateManyAndReturn
   */
  export type PassoReceitaUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PassoReceita
     */
    select?: PassoReceitaSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PassoReceita
     */
    omit?: PassoReceitaOmit<ExtArgs> | null
    /**
     * The data used to update PassoReceitas.
     */
    data: XOR<PassoReceitaUpdateManyMutationInput, PassoReceitaUncheckedUpdateManyInput>
    /**
     * Filter which PassoReceitas to update
     */
    where?: PassoReceitaWhereInput
    /**
     * Limit how many PassoReceitas to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassoReceitaIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PassoReceita upsert
   */
  export type PassoReceitaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PassoReceita
     */
    select?: PassoReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PassoReceita
     */
    omit?: PassoReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassoReceitaInclude<ExtArgs> | null
    /**
     * The filter to search for the PassoReceita to update in case it exists.
     */
    where: PassoReceitaWhereUniqueInput
    /**
     * In case the PassoReceita found by the `where` argument doesn't exist, create a new PassoReceita with this data.
     */
    create: XOR<PassoReceitaCreateInput, PassoReceitaUncheckedCreateInput>
    /**
     * In case the PassoReceita was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PassoReceitaUpdateInput, PassoReceitaUncheckedUpdateInput>
  }

  /**
   * PassoReceita delete
   */
  export type PassoReceitaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PassoReceita
     */
    select?: PassoReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PassoReceita
     */
    omit?: PassoReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassoReceitaInclude<ExtArgs> | null
    /**
     * Filter which PassoReceita to delete.
     */
    where: PassoReceitaWhereUniqueInput
  }

  /**
   * PassoReceita deleteMany
   */
  export type PassoReceitaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PassoReceitas to delete
     */
    where?: PassoReceitaWhereInput
    /**
     * Limit how many PassoReceitas to delete.
     */
    limit?: number
  }

  /**
   * PassoReceita without action
   */
  export type PassoReceitaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PassoReceita
     */
    select?: PassoReceitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PassoReceita
     */
    omit?: PassoReceitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassoReceitaInclude<ExtArgs> | null
  }


  /**
   * Model ReceitaFavorita
   */

  export type AggregateReceitaFavorita = {
    _count: ReceitaFavoritaCountAggregateOutputType | null
    _min: ReceitaFavoritaMinAggregateOutputType | null
    _max: ReceitaFavoritaMaxAggregateOutputType | null
  }

  export type ReceitaFavoritaMinAggregateOutputType = {
    id: string | null
    usuarioId: string | null
    receitaId: string | null
  }

  export type ReceitaFavoritaMaxAggregateOutputType = {
    id: string | null
    usuarioId: string | null
    receitaId: string | null
  }

  export type ReceitaFavoritaCountAggregateOutputType = {
    id: number
    usuarioId: number
    receitaId: number
    _all: number
  }


  export type ReceitaFavoritaMinAggregateInputType = {
    id?: true
    usuarioId?: true
    receitaId?: true
  }

  export type ReceitaFavoritaMaxAggregateInputType = {
    id?: true
    usuarioId?: true
    receitaId?: true
  }

  export type ReceitaFavoritaCountAggregateInputType = {
    id?: true
    usuarioId?: true
    receitaId?: true
    _all?: true
  }

  export type ReceitaFavoritaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReceitaFavorita to aggregate.
     */
    where?: ReceitaFavoritaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceitaFavoritas to fetch.
     */
    orderBy?: ReceitaFavoritaOrderByWithRelationInput | ReceitaFavoritaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReceitaFavoritaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceitaFavoritas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceitaFavoritas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ReceitaFavoritas
    **/
    _count?: true | ReceitaFavoritaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReceitaFavoritaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReceitaFavoritaMaxAggregateInputType
  }

  export type GetReceitaFavoritaAggregateType<T extends ReceitaFavoritaAggregateArgs> = {
        [P in keyof T & keyof AggregateReceitaFavorita]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReceitaFavorita[P]>
      : GetScalarType<T[P], AggregateReceitaFavorita[P]>
  }




  export type ReceitaFavoritaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReceitaFavoritaWhereInput
    orderBy?: ReceitaFavoritaOrderByWithAggregationInput | ReceitaFavoritaOrderByWithAggregationInput[]
    by: ReceitaFavoritaScalarFieldEnum[] | ReceitaFavoritaScalarFieldEnum
    having?: ReceitaFavoritaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReceitaFavoritaCountAggregateInputType | true
    _min?: ReceitaFavoritaMinAggregateInputType
    _max?: ReceitaFavoritaMaxAggregateInputType
  }

  export type ReceitaFavoritaGroupByOutputType = {
    id: string
    usuarioId: string
    receitaId: string
    _count: ReceitaFavoritaCountAggregateOutputType | null
    _min: ReceitaFavoritaMinAggregateOutputType | null
    _max: ReceitaFavoritaMaxAggregateOutputType | null
  }

  type GetReceitaFavoritaGroupByPayload<T extends ReceitaFavoritaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReceitaFavoritaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReceitaFavoritaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReceitaFavoritaGroupByOutputType[P]>
            : GetScalarType<T[P], ReceitaFavoritaGroupByOutputType[P]>
        }
      >
    >


  export type ReceitaFavoritaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    usuarioId?: boolean
    receitaId?: boolean
    receita?: boolean | ReceitaDefaultArgs<ExtArgs>
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receitaFavorita"]>

  export type ReceitaFavoritaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    usuarioId?: boolean
    receitaId?: boolean
    receita?: boolean | ReceitaDefaultArgs<ExtArgs>
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receitaFavorita"]>

  export type ReceitaFavoritaSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    usuarioId?: boolean
    receitaId?: boolean
    receita?: boolean | ReceitaDefaultArgs<ExtArgs>
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receitaFavorita"]>

  export type ReceitaFavoritaSelectScalar = {
    id?: boolean
    usuarioId?: boolean
    receitaId?: boolean
  }

  export type ReceitaFavoritaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "usuarioId" | "receitaId", ExtArgs["result"]["receitaFavorita"]>
  export type ReceitaFavoritaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receita?: boolean | ReceitaDefaultArgs<ExtArgs>
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }
  export type ReceitaFavoritaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receita?: boolean | ReceitaDefaultArgs<ExtArgs>
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }
  export type ReceitaFavoritaIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receita?: boolean | ReceitaDefaultArgs<ExtArgs>
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }

  export type $ReceitaFavoritaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReceitaFavorita"
    objects: {
      receita: Prisma.$ReceitaPayload<ExtArgs>
      usuario: Prisma.$UsuarioPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      usuarioId: string
      receitaId: string
    }, ExtArgs["result"]["receitaFavorita"]>
    composites: {}
  }

  type ReceitaFavoritaGetPayload<S extends boolean | null | undefined | ReceitaFavoritaDefaultArgs> = $Result.GetResult<Prisma.$ReceitaFavoritaPayload, S>

  type ReceitaFavoritaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReceitaFavoritaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReceitaFavoritaCountAggregateInputType | true
    }

  export interface ReceitaFavoritaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReceitaFavorita'], meta: { name: 'ReceitaFavorita' } }
    /**
     * Find zero or one ReceitaFavorita that matches the filter.
     * @param {ReceitaFavoritaFindUniqueArgs} args - Arguments to find a ReceitaFavorita
     * @example
     * // Get one ReceitaFavorita
     * const receitaFavorita = await prisma.receitaFavorita.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReceitaFavoritaFindUniqueArgs>(args: SelectSubset<T, ReceitaFavoritaFindUniqueArgs<ExtArgs>>): Prisma__ReceitaFavoritaClient<$Result.GetResult<Prisma.$ReceitaFavoritaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ReceitaFavorita that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReceitaFavoritaFindUniqueOrThrowArgs} args - Arguments to find a ReceitaFavorita
     * @example
     * // Get one ReceitaFavorita
     * const receitaFavorita = await prisma.receitaFavorita.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReceitaFavoritaFindUniqueOrThrowArgs>(args: SelectSubset<T, ReceitaFavoritaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReceitaFavoritaClient<$Result.GetResult<Prisma.$ReceitaFavoritaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReceitaFavorita that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceitaFavoritaFindFirstArgs} args - Arguments to find a ReceitaFavorita
     * @example
     * // Get one ReceitaFavorita
     * const receitaFavorita = await prisma.receitaFavorita.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReceitaFavoritaFindFirstArgs>(args?: SelectSubset<T, ReceitaFavoritaFindFirstArgs<ExtArgs>>): Prisma__ReceitaFavoritaClient<$Result.GetResult<Prisma.$ReceitaFavoritaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReceitaFavorita that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceitaFavoritaFindFirstOrThrowArgs} args - Arguments to find a ReceitaFavorita
     * @example
     * // Get one ReceitaFavorita
     * const receitaFavorita = await prisma.receitaFavorita.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReceitaFavoritaFindFirstOrThrowArgs>(args?: SelectSubset<T, ReceitaFavoritaFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReceitaFavoritaClient<$Result.GetResult<Prisma.$ReceitaFavoritaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ReceitaFavoritas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceitaFavoritaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReceitaFavoritas
     * const receitaFavoritas = await prisma.receitaFavorita.findMany()
     * 
     * // Get first 10 ReceitaFavoritas
     * const receitaFavoritas = await prisma.receitaFavorita.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const receitaFavoritaWithIdOnly = await prisma.receitaFavorita.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReceitaFavoritaFindManyArgs>(args?: SelectSubset<T, ReceitaFavoritaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceitaFavoritaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ReceitaFavorita.
     * @param {ReceitaFavoritaCreateArgs} args - Arguments to create a ReceitaFavorita.
     * @example
     * // Create one ReceitaFavorita
     * const ReceitaFavorita = await prisma.receitaFavorita.create({
     *   data: {
     *     // ... data to create a ReceitaFavorita
     *   }
     * })
     * 
     */
    create<T extends ReceitaFavoritaCreateArgs>(args: SelectSubset<T, ReceitaFavoritaCreateArgs<ExtArgs>>): Prisma__ReceitaFavoritaClient<$Result.GetResult<Prisma.$ReceitaFavoritaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ReceitaFavoritas.
     * @param {ReceitaFavoritaCreateManyArgs} args - Arguments to create many ReceitaFavoritas.
     * @example
     * // Create many ReceitaFavoritas
     * const receitaFavorita = await prisma.receitaFavorita.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReceitaFavoritaCreateManyArgs>(args?: SelectSubset<T, ReceitaFavoritaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ReceitaFavoritas and returns the data saved in the database.
     * @param {ReceitaFavoritaCreateManyAndReturnArgs} args - Arguments to create many ReceitaFavoritas.
     * @example
     * // Create many ReceitaFavoritas
     * const receitaFavorita = await prisma.receitaFavorita.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ReceitaFavoritas and only return the `id`
     * const receitaFavoritaWithIdOnly = await prisma.receitaFavorita.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReceitaFavoritaCreateManyAndReturnArgs>(args?: SelectSubset<T, ReceitaFavoritaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceitaFavoritaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ReceitaFavorita.
     * @param {ReceitaFavoritaDeleteArgs} args - Arguments to delete one ReceitaFavorita.
     * @example
     * // Delete one ReceitaFavorita
     * const ReceitaFavorita = await prisma.receitaFavorita.delete({
     *   where: {
     *     // ... filter to delete one ReceitaFavorita
     *   }
     * })
     * 
     */
    delete<T extends ReceitaFavoritaDeleteArgs>(args: SelectSubset<T, ReceitaFavoritaDeleteArgs<ExtArgs>>): Prisma__ReceitaFavoritaClient<$Result.GetResult<Prisma.$ReceitaFavoritaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ReceitaFavorita.
     * @param {ReceitaFavoritaUpdateArgs} args - Arguments to update one ReceitaFavorita.
     * @example
     * // Update one ReceitaFavorita
     * const receitaFavorita = await prisma.receitaFavorita.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReceitaFavoritaUpdateArgs>(args: SelectSubset<T, ReceitaFavoritaUpdateArgs<ExtArgs>>): Prisma__ReceitaFavoritaClient<$Result.GetResult<Prisma.$ReceitaFavoritaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ReceitaFavoritas.
     * @param {ReceitaFavoritaDeleteManyArgs} args - Arguments to filter ReceitaFavoritas to delete.
     * @example
     * // Delete a few ReceitaFavoritas
     * const { count } = await prisma.receitaFavorita.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReceitaFavoritaDeleteManyArgs>(args?: SelectSubset<T, ReceitaFavoritaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReceitaFavoritas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceitaFavoritaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReceitaFavoritas
     * const receitaFavorita = await prisma.receitaFavorita.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReceitaFavoritaUpdateManyArgs>(args: SelectSubset<T, ReceitaFavoritaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReceitaFavoritas and returns the data updated in the database.
     * @param {ReceitaFavoritaUpdateManyAndReturnArgs} args - Arguments to update many ReceitaFavoritas.
     * @example
     * // Update many ReceitaFavoritas
     * const receitaFavorita = await prisma.receitaFavorita.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ReceitaFavoritas and only return the `id`
     * const receitaFavoritaWithIdOnly = await prisma.receitaFavorita.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReceitaFavoritaUpdateManyAndReturnArgs>(args: SelectSubset<T, ReceitaFavoritaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceitaFavoritaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ReceitaFavorita.
     * @param {ReceitaFavoritaUpsertArgs} args - Arguments to update or create a ReceitaFavorita.
     * @example
     * // Update or create a ReceitaFavorita
     * const receitaFavorita = await prisma.receitaFavorita.upsert({
     *   create: {
     *     // ... data to create a ReceitaFavorita
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReceitaFavorita we want to update
     *   }
     * })
     */
    upsert<T extends ReceitaFavoritaUpsertArgs>(args: SelectSubset<T, ReceitaFavoritaUpsertArgs<ExtArgs>>): Prisma__ReceitaFavoritaClient<$Result.GetResult<Prisma.$ReceitaFavoritaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ReceitaFavoritas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceitaFavoritaCountArgs} args - Arguments to filter ReceitaFavoritas to count.
     * @example
     * // Count the number of ReceitaFavoritas
     * const count = await prisma.receitaFavorita.count({
     *   where: {
     *     // ... the filter for the ReceitaFavoritas we want to count
     *   }
     * })
    **/
    count<T extends ReceitaFavoritaCountArgs>(
      args?: Subset<T, ReceitaFavoritaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReceitaFavoritaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReceitaFavorita.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceitaFavoritaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReceitaFavoritaAggregateArgs>(args: Subset<T, ReceitaFavoritaAggregateArgs>): Prisma.PrismaPromise<GetReceitaFavoritaAggregateType<T>>

    /**
     * Group by ReceitaFavorita.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceitaFavoritaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReceitaFavoritaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReceitaFavoritaGroupByArgs['orderBy'] }
        : { orderBy?: ReceitaFavoritaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReceitaFavoritaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReceitaFavoritaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReceitaFavorita model
   */
  readonly fields: ReceitaFavoritaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReceitaFavorita.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReceitaFavoritaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    receita<T extends ReceitaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReceitaDefaultArgs<ExtArgs>>): Prisma__ReceitaClient<$Result.GetResult<Prisma.$ReceitaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    usuario<T extends UsuarioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioDefaultArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ReceitaFavorita model
   */
  interface ReceitaFavoritaFieldRefs {
    readonly id: FieldRef<"ReceitaFavorita", 'String'>
    readonly usuarioId: FieldRef<"ReceitaFavorita", 'String'>
    readonly receitaId: FieldRef<"ReceitaFavorita", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ReceitaFavorita findUnique
   */
  export type ReceitaFavoritaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceitaFavorita
     */
    select?: ReceitaFavoritaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceitaFavorita
     */
    omit?: ReceitaFavoritaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaFavoritaInclude<ExtArgs> | null
    /**
     * Filter, which ReceitaFavorita to fetch.
     */
    where: ReceitaFavoritaWhereUniqueInput
  }

  /**
   * ReceitaFavorita findUniqueOrThrow
   */
  export type ReceitaFavoritaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceitaFavorita
     */
    select?: ReceitaFavoritaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceitaFavorita
     */
    omit?: ReceitaFavoritaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaFavoritaInclude<ExtArgs> | null
    /**
     * Filter, which ReceitaFavorita to fetch.
     */
    where: ReceitaFavoritaWhereUniqueInput
  }

  /**
   * ReceitaFavorita findFirst
   */
  export type ReceitaFavoritaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceitaFavorita
     */
    select?: ReceitaFavoritaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceitaFavorita
     */
    omit?: ReceitaFavoritaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaFavoritaInclude<ExtArgs> | null
    /**
     * Filter, which ReceitaFavorita to fetch.
     */
    where?: ReceitaFavoritaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceitaFavoritas to fetch.
     */
    orderBy?: ReceitaFavoritaOrderByWithRelationInput | ReceitaFavoritaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReceitaFavoritas.
     */
    cursor?: ReceitaFavoritaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceitaFavoritas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceitaFavoritas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReceitaFavoritas.
     */
    distinct?: ReceitaFavoritaScalarFieldEnum | ReceitaFavoritaScalarFieldEnum[]
  }

  /**
   * ReceitaFavorita findFirstOrThrow
   */
  export type ReceitaFavoritaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceitaFavorita
     */
    select?: ReceitaFavoritaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceitaFavorita
     */
    omit?: ReceitaFavoritaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaFavoritaInclude<ExtArgs> | null
    /**
     * Filter, which ReceitaFavorita to fetch.
     */
    where?: ReceitaFavoritaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceitaFavoritas to fetch.
     */
    orderBy?: ReceitaFavoritaOrderByWithRelationInput | ReceitaFavoritaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReceitaFavoritas.
     */
    cursor?: ReceitaFavoritaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceitaFavoritas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceitaFavoritas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReceitaFavoritas.
     */
    distinct?: ReceitaFavoritaScalarFieldEnum | ReceitaFavoritaScalarFieldEnum[]
  }

  /**
   * ReceitaFavorita findMany
   */
  export type ReceitaFavoritaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceitaFavorita
     */
    select?: ReceitaFavoritaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceitaFavorita
     */
    omit?: ReceitaFavoritaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaFavoritaInclude<ExtArgs> | null
    /**
     * Filter, which ReceitaFavoritas to fetch.
     */
    where?: ReceitaFavoritaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceitaFavoritas to fetch.
     */
    orderBy?: ReceitaFavoritaOrderByWithRelationInput | ReceitaFavoritaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ReceitaFavoritas.
     */
    cursor?: ReceitaFavoritaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceitaFavoritas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceitaFavoritas.
     */
    skip?: number
    distinct?: ReceitaFavoritaScalarFieldEnum | ReceitaFavoritaScalarFieldEnum[]
  }

  /**
   * ReceitaFavorita create
   */
  export type ReceitaFavoritaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceitaFavorita
     */
    select?: ReceitaFavoritaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceitaFavorita
     */
    omit?: ReceitaFavoritaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaFavoritaInclude<ExtArgs> | null
    /**
     * The data needed to create a ReceitaFavorita.
     */
    data: XOR<ReceitaFavoritaCreateInput, ReceitaFavoritaUncheckedCreateInput>
  }

  /**
   * ReceitaFavorita createMany
   */
  export type ReceitaFavoritaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReceitaFavoritas.
     */
    data: ReceitaFavoritaCreateManyInput | ReceitaFavoritaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ReceitaFavorita createManyAndReturn
   */
  export type ReceitaFavoritaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceitaFavorita
     */
    select?: ReceitaFavoritaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReceitaFavorita
     */
    omit?: ReceitaFavoritaOmit<ExtArgs> | null
    /**
     * The data used to create many ReceitaFavoritas.
     */
    data: ReceitaFavoritaCreateManyInput | ReceitaFavoritaCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaFavoritaIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReceitaFavorita update
   */
  export type ReceitaFavoritaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceitaFavorita
     */
    select?: ReceitaFavoritaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceitaFavorita
     */
    omit?: ReceitaFavoritaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaFavoritaInclude<ExtArgs> | null
    /**
     * The data needed to update a ReceitaFavorita.
     */
    data: XOR<ReceitaFavoritaUpdateInput, ReceitaFavoritaUncheckedUpdateInput>
    /**
     * Choose, which ReceitaFavorita to update.
     */
    where: ReceitaFavoritaWhereUniqueInput
  }

  /**
   * ReceitaFavorita updateMany
   */
  export type ReceitaFavoritaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReceitaFavoritas.
     */
    data: XOR<ReceitaFavoritaUpdateManyMutationInput, ReceitaFavoritaUncheckedUpdateManyInput>
    /**
     * Filter which ReceitaFavoritas to update
     */
    where?: ReceitaFavoritaWhereInput
    /**
     * Limit how many ReceitaFavoritas to update.
     */
    limit?: number
  }

  /**
   * ReceitaFavorita updateManyAndReturn
   */
  export type ReceitaFavoritaUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceitaFavorita
     */
    select?: ReceitaFavoritaSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReceitaFavorita
     */
    omit?: ReceitaFavoritaOmit<ExtArgs> | null
    /**
     * The data used to update ReceitaFavoritas.
     */
    data: XOR<ReceitaFavoritaUpdateManyMutationInput, ReceitaFavoritaUncheckedUpdateManyInput>
    /**
     * Filter which ReceitaFavoritas to update
     */
    where?: ReceitaFavoritaWhereInput
    /**
     * Limit how many ReceitaFavoritas to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaFavoritaIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReceitaFavorita upsert
   */
  export type ReceitaFavoritaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceitaFavorita
     */
    select?: ReceitaFavoritaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceitaFavorita
     */
    omit?: ReceitaFavoritaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaFavoritaInclude<ExtArgs> | null
    /**
     * The filter to search for the ReceitaFavorita to update in case it exists.
     */
    where: ReceitaFavoritaWhereUniqueInput
    /**
     * In case the ReceitaFavorita found by the `where` argument doesn't exist, create a new ReceitaFavorita with this data.
     */
    create: XOR<ReceitaFavoritaCreateInput, ReceitaFavoritaUncheckedCreateInput>
    /**
     * In case the ReceitaFavorita was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReceitaFavoritaUpdateInput, ReceitaFavoritaUncheckedUpdateInput>
  }

  /**
   * ReceitaFavorita delete
   */
  export type ReceitaFavoritaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceitaFavorita
     */
    select?: ReceitaFavoritaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceitaFavorita
     */
    omit?: ReceitaFavoritaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaFavoritaInclude<ExtArgs> | null
    /**
     * Filter which ReceitaFavorita to delete.
     */
    where: ReceitaFavoritaWhereUniqueInput
  }

  /**
   * ReceitaFavorita deleteMany
   */
  export type ReceitaFavoritaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReceitaFavoritas to delete
     */
    where?: ReceitaFavoritaWhereInput
    /**
     * Limit how many ReceitaFavoritas to delete.
     */
    limit?: number
  }

  /**
   * ReceitaFavorita without action
   */
  export type ReceitaFavoritaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceitaFavorita
     */
    select?: ReceitaFavoritaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceitaFavorita
     */
    omit?: ReceitaFavoritaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceitaFavoritaInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UsuarioScalarFieldEnum: {
    id: 'id',
    email: 'email',
    nome: 'nome',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    altoContraste: 'altoContraste',
    reducaoEstimulos: 'reducaoEstimulos',
    textoGrande: 'textoGrande',
    metaHorasSono: 'metaHorasSono',
    metaTarefasPrioritarias: 'metaTarefasPrioritarias',
    metaCoposAgua: 'metaCoposAgua',
    metaPausasProgramadas: 'metaPausasProgramadas',
    notificacoesAtivas: 'notificacoesAtivas',
    pausasAtivas: 'pausasAtivas'
  };

  export type UsuarioScalarFieldEnum = (typeof UsuarioScalarFieldEnum)[keyof typeof UsuarioScalarFieldEnum]


  export const RefeicaoScalarFieldEnum: {
    id: 'id',
    horario: 'horario',
    descricao: 'descricao',
    usuarioId: 'usuarioId'
  };

  export type RefeicaoScalarFieldEnum = (typeof RefeicaoScalarFieldEnum)[keyof typeof RefeicaoScalarFieldEnum]


  export const RegistroRefeicaoScalarFieldEnum: {
    id: 'id',
    data: 'data',
    horario: 'horario',
    descricao: 'descricao',
    tipoIcone: 'tipoIcone',
    foto: 'foto',
    usuarioId: 'usuarioId'
  };

  export type RegistroRefeicaoScalarFieldEnum = (typeof RegistroRefeicaoScalarFieldEnum)[keyof typeof RegistroRefeicaoScalarFieldEnum]


  export const RegistroHidratacaoScalarFieldEnum: {
    id: 'id',
    data: 'data',
    horario: 'horario',
    quantidade: 'quantidade',
    usuarioId: 'usuarioId'
  };

  export type RegistroHidratacaoScalarFieldEnum = (typeof RegistroHidratacaoScalarFieldEnum)[keyof typeof RegistroHidratacaoScalarFieldEnum]


  export const RegistroSonoScalarFieldEnum: {
    id: 'id',
    inicio: 'inicio',
    fim: 'fim',
    qualidade: 'qualidade',
    notas: 'notas',
    usuarioId: 'usuarioId'
  };

  export type RegistroSonoScalarFieldEnum = (typeof RegistroSonoScalarFieldEnum)[keyof typeof RegistroSonoScalarFieldEnum]


  export const LembreteSonoScalarFieldEnum: {
    id: 'id',
    tipo: 'tipo',
    horario: 'horario',
    diasSemana: 'diasSemana',
    ativo: 'ativo',
    usuarioId: 'usuarioId'
  };

  export type LembreteSonoScalarFieldEnum = (typeof LembreteSonoScalarFieldEnum)[keyof typeof LembreteSonoScalarFieldEnum]


  export const ReceitaScalarFieldEnum: {
    id: 'id',
    nome: 'nome',
    descricao: 'descricao',
    categorias: 'categorias',
    tags: 'tags',
    tempoPreparo: 'tempoPreparo',
    porcoes: 'porcoes',
    calorias: 'calorias',
    imagem: 'imagem',
    usuarioId: 'usuarioId'
  };

  export type ReceitaScalarFieldEnum = (typeof ReceitaScalarFieldEnum)[keyof typeof ReceitaScalarFieldEnum]


  export const IngredienteScalarFieldEnum: {
    id: 'id',
    nome: 'nome',
    quantidade: 'quantidade',
    unidade: 'unidade',
    receitaId: 'receitaId'
  };

  export type IngredienteScalarFieldEnum = (typeof IngredienteScalarFieldEnum)[keyof typeof IngredienteScalarFieldEnum]


  export const PassoReceitaScalarFieldEnum: {
    id: 'id',
    ordem: 'ordem',
    descricao: 'descricao',
    receitaId: 'receitaId'
  };

  export type PassoReceitaScalarFieldEnum = (typeof PassoReceitaScalarFieldEnum)[keyof typeof PassoReceitaScalarFieldEnum]


  export const ReceitaFavoritaScalarFieldEnum: {
    id: 'id',
    usuarioId: 'usuarioId',
    receitaId: 'receitaId'
  };

  export type ReceitaFavoritaScalarFieldEnum = (typeof ReceitaFavoritaScalarFieldEnum)[keyof typeof ReceitaFavoritaScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UsuarioWhereInput = {
    AND?: UsuarioWhereInput | UsuarioWhereInput[]
    OR?: UsuarioWhereInput[]
    NOT?: UsuarioWhereInput | UsuarioWhereInput[]
    id?: StringFilter<"Usuario"> | string
    email?: StringFilter<"Usuario"> | string
    nome?: StringFilter<"Usuario"> | string
    createdAt?: DateTimeFilter<"Usuario"> | Date | string
    updatedAt?: DateTimeFilter<"Usuario"> | Date | string
    altoContraste?: BoolFilter<"Usuario"> | boolean
    reducaoEstimulos?: BoolFilter<"Usuario"> | boolean
    textoGrande?: BoolFilter<"Usuario"> | boolean
    metaHorasSono?: IntFilter<"Usuario"> | number
    metaTarefasPrioritarias?: IntFilter<"Usuario"> | number
    metaCoposAgua?: IntFilter<"Usuario"> | number
    metaPausasProgramadas?: IntFilter<"Usuario"> | number
    notificacoesAtivas?: BoolFilter<"Usuario"> | boolean
    pausasAtivas?: BoolFilter<"Usuario"> | boolean
    lembretesSono?: LembreteSonoListRelationFilter
    receitas?: ReceitaListRelationFilter
    receitasFavoritas?: ReceitaFavoritaListRelationFilter
    refeicoes?: RefeicaoListRelationFilter
    registrosRefeicao?: RegistroRefeicaoListRelationFilter
    registrosSono?: RegistroSonoListRelationFilter
  }

  export type UsuarioOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    nome?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    altoContraste?: SortOrder
    reducaoEstimulos?: SortOrder
    textoGrande?: SortOrder
    metaHorasSono?: SortOrder
    metaTarefasPrioritarias?: SortOrder
    metaCoposAgua?: SortOrder
    metaPausasProgramadas?: SortOrder
    notificacoesAtivas?: SortOrder
    pausasAtivas?: SortOrder
    lembretesSono?: LembreteSonoOrderByRelationAggregateInput
    receitas?: ReceitaOrderByRelationAggregateInput
    receitasFavoritas?: ReceitaFavoritaOrderByRelationAggregateInput
    refeicoes?: RefeicaoOrderByRelationAggregateInput
    registrosRefeicao?: RegistroRefeicaoOrderByRelationAggregateInput
    registrosSono?: RegistroSonoOrderByRelationAggregateInput
  }

  export type UsuarioWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UsuarioWhereInput | UsuarioWhereInput[]
    OR?: UsuarioWhereInput[]
    NOT?: UsuarioWhereInput | UsuarioWhereInput[]
    nome?: StringFilter<"Usuario"> | string
    createdAt?: DateTimeFilter<"Usuario"> | Date | string
    updatedAt?: DateTimeFilter<"Usuario"> | Date | string
    altoContraste?: BoolFilter<"Usuario"> | boolean
    reducaoEstimulos?: BoolFilter<"Usuario"> | boolean
    textoGrande?: BoolFilter<"Usuario"> | boolean
    metaHorasSono?: IntFilter<"Usuario"> | number
    metaTarefasPrioritarias?: IntFilter<"Usuario"> | number
    metaCoposAgua?: IntFilter<"Usuario"> | number
    metaPausasProgramadas?: IntFilter<"Usuario"> | number
    notificacoesAtivas?: BoolFilter<"Usuario"> | boolean
    pausasAtivas?: BoolFilter<"Usuario"> | boolean
    lembretesSono?: LembreteSonoListRelationFilter
    receitas?: ReceitaListRelationFilter
    receitasFavoritas?: ReceitaFavoritaListRelationFilter
    refeicoes?: RefeicaoListRelationFilter
    registrosRefeicao?: RegistroRefeicaoListRelationFilter
    registrosSono?: RegistroSonoListRelationFilter
  }, "id" | "email">

  export type UsuarioOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    nome?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    altoContraste?: SortOrder
    reducaoEstimulos?: SortOrder
    textoGrande?: SortOrder
    metaHorasSono?: SortOrder
    metaTarefasPrioritarias?: SortOrder
    metaCoposAgua?: SortOrder
    metaPausasProgramadas?: SortOrder
    notificacoesAtivas?: SortOrder
    pausasAtivas?: SortOrder
    _count?: UsuarioCountOrderByAggregateInput
    _avg?: UsuarioAvgOrderByAggregateInput
    _max?: UsuarioMaxOrderByAggregateInput
    _min?: UsuarioMinOrderByAggregateInput
    _sum?: UsuarioSumOrderByAggregateInput
  }

  export type UsuarioScalarWhereWithAggregatesInput = {
    AND?: UsuarioScalarWhereWithAggregatesInput | UsuarioScalarWhereWithAggregatesInput[]
    OR?: UsuarioScalarWhereWithAggregatesInput[]
    NOT?: UsuarioScalarWhereWithAggregatesInput | UsuarioScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Usuario"> | string
    email?: StringWithAggregatesFilter<"Usuario"> | string
    nome?: StringWithAggregatesFilter<"Usuario"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Usuario"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Usuario"> | Date | string
    altoContraste?: BoolWithAggregatesFilter<"Usuario"> | boolean
    reducaoEstimulos?: BoolWithAggregatesFilter<"Usuario"> | boolean
    textoGrande?: BoolWithAggregatesFilter<"Usuario"> | boolean
    metaHorasSono?: IntWithAggregatesFilter<"Usuario"> | number
    metaTarefasPrioritarias?: IntWithAggregatesFilter<"Usuario"> | number
    metaCoposAgua?: IntWithAggregatesFilter<"Usuario"> | number
    metaPausasProgramadas?: IntWithAggregatesFilter<"Usuario"> | number
    notificacoesAtivas?: BoolWithAggregatesFilter<"Usuario"> | boolean
    pausasAtivas?: BoolWithAggregatesFilter<"Usuario"> | boolean
  }

  export type RefeicaoWhereInput = {
    AND?: RefeicaoWhereInput | RefeicaoWhereInput[]
    OR?: RefeicaoWhereInput[]
    NOT?: RefeicaoWhereInput | RefeicaoWhereInput[]
    id?: StringFilter<"Refeicao"> | string
    horario?: StringFilter<"Refeicao"> | string
    descricao?: StringFilter<"Refeicao"> | string
    usuarioId?: StringFilter<"Refeicao"> | string
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
  }

  export type RefeicaoOrderByWithRelationInput = {
    id?: SortOrder
    horario?: SortOrder
    descricao?: SortOrder
    usuarioId?: SortOrder
    usuario?: UsuarioOrderByWithRelationInput
  }

  export type RefeicaoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RefeicaoWhereInput | RefeicaoWhereInput[]
    OR?: RefeicaoWhereInput[]
    NOT?: RefeicaoWhereInput | RefeicaoWhereInput[]
    horario?: StringFilter<"Refeicao"> | string
    descricao?: StringFilter<"Refeicao"> | string
    usuarioId?: StringFilter<"Refeicao"> | string
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
  }, "id">

  export type RefeicaoOrderByWithAggregationInput = {
    id?: SortOrder
    horario?: SortOrder
    descricao?: SortOrder
    usuarioId?: SortOrder
    _count?: RefeicaoCountOrderByAggregateInput
    _max?: RefeicaoMaxOrderByAggregateInput
    _min?: RefeicaoMinOrderByAggregateInput
  }

  export type RefeicaoScalarWhereWithAggregatesInput = {
    AND?: RefeicaoScalarWhereWithAggregatesInput | RefeicaoScalarWhereWithAggregatesInput[]
    OR?: RefeicaoScalarWhereWithAggregatesInput[]
    NOT?: RefeicaoScalarWhereWithAggregatesInput | RefeicaoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Refeicao"> | string
    horario?: StringWithAggregatesFilter<"Refeicao"> | string
    descricao?: StringWithAggregatesFilter<"Refeicao"> | string
    usuarioId?: StringWithAggregatesFilter<"Refeicao"> | string
  }

  export type RegistroRefeicaoWhereInput = {
    AND?: RegistroRefeicaoWhereInput | RegistroRefeicaoWhereInput[]
    OR?: RegistroRefeicaoWhereInput[]
    NOT?: RegistroRefeicaoWhereInput | RegistroRefeicaoWhereInput[]
    id?: StringFilter<"RegistroRefeicao"> | string
    data?: DateTimeFilter<"RegistroRefeicao"> | Date | string
    horario?: StringFilter<"RegistroRefeicao"> | string
    descricao?: StringFilter<"RegistroRefeicao"> | string
    tipoIcone?: StringNullableFilter<"RegistroRefeicao"> | string | null
    foto?: StringNullableFilter<"RegistroRefeicao"> | string | null
    usuarioId?: StringFilter<"RegistroRefeicao"> | string
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
  }

  export type RegistroRefeicaoOrderByWithRelationInput = {
    id?: SortOrder
    data?: SortOrder
    horario?: SortOrder
    descricao?: SortOrder
    tipoIcone?: SortOrderInput | SortOrder
    foto?: SortOrderInput | SortOrder
    usuarioId?: SortOrder
    usuario?: UsuarioOrderByWithRelationInput
  }

  export type RegistroRefeicaoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RegistroRefeicaoWhereInput | RegistroRefeicaoWhereInput[]
    OR?: RegistroRefeicaoWhereInput[]
    NOT?: RegistroRefeicaoWhereInput | RegistroRefeicaoWhereInput[]
    data?: DateTimeFilter<"RegistroRefeicao"> | Date | string
    horario?: StringFilter<"RegistroRefeicao"> | string
    descricao?: StringFilter<"RegistroRefeicao"> | string
    tipoIcone?: StringNullableFilter<"RegistroRefeicao"> | string | null
    foto?: StringNullableFilter<"RegistroRefeicao"> | string | null
    usuarioId?: StringFilter<"RegistroRefeicao"> | string
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
  }, "id">

  export type RegistroRefeicaoOrderByWithAggregationInput = {
    id?: SortOrder
    data?: SortOrder
    horario?: SortOrder
    descricao?: SortOrder
    tipoIcone?: SortOrderInput | SortOrder
    foto?: SortOrderInput | SortOrder
    usuarioId?: SortOrder
    _count?: RegistroRefeicaoCountOrderByAggregateInput
    _max?: RegistroRefeicaoMaxOrderByAggregateInput
    _min?: RegistroRefeicaoMinOrderByAggregateInput
  }

  export type RegistroRefeicaoScalarWhereWithAggregatesInput = {
    AND?: RegistroRefeicaoScalarWhereWithAggregatesInput | RegistroRefeicaoScalarWhereWithAggregatesInput[]
    OR?: RegistroRefeicaoScalarWhereWithAggregatesInput[]
    NOT?: RegistroRefeicaoScalarWhereWithAggregatesInput | RegistroRefeicaoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RegistroRefeicao"> | string
    data?: DateTimeWithAggregatesFilter<"RegistroRefeicao"> | Date | string
    horario?: StringWithAggregatesFilter<"RegistroRefeicao"> | string
    descricao?: StringWithAggregatesFilter<"RegistroRefeicao"> | string
    tipoIcone?: StringNullableWithAggregatesFilter<"RegistroRefeicao"> | string | null
    foto?: StringNullableWithAggregatesFilter<"RegistroRefeicao"> | string | null
    usuarioId?: StringWithAggregatesFilter<"RegistroRefeicao"> | string
  }

  export type RegistroHidratacaoWhereInput = {
    AND?: RegistroHidratacaoWhereInput | RegistroHidratacaoWhereInput[]
    OR?: RegistroHidratacaoWhereInput[]
    NOT?: RegistroHidratacaoWhereInput | RegistroHidratacaoWhereInput[]
    id?: StringFilter<"RegistroHidratacao"> | string
    data?: DateTimeFilter<"RegistroHidratacao"> | Date | string
    horario?: StringFilter<"RegistroHidratacao"> | string
    quantidade?: IntFilter<"RegistroHidratacao"> | number
    usuarioId?: StringFilter<"RegistroHidratacao"> | string
  }

  export type RegistroHidratacaoOrderByWithRelationInput = {
    id?: SortOrder
    data?: SortOrder
    horario?: SortOrder
    quantidade?: SortOrder
    usuarioId?: SortOrder
  }

  export type RegistroHidratacaoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RegistroHidratacaoWhereInput | RegistroHidratacaoWhereInput[]
    OR?: RegistroHidratacaoWhereInput[]
    NOT?: RegistroHidratacaoWhereInput | RegistroHidratacaoWhereInput[]
    data?: DateTimeFilter<"RegistroHidratacao"> | Date | string
    horario?: StringFilter<"RegistroHidratacao"> | string
    quantidade?: IntFilter<"RegistroHidratacao"> | number
    usuarioId?: StringFilter<"RegistroHidratacao"> | string
  }, "id">

  export type RegistroHidratacaoOrderByWithAggregationInput = {
    id?: SortOrder
    data?: SortOrder
    horario?: SortOrder
    quantidade?: SortOrder
    usuarioId?: SortOrder
    _count?: RegistroHidratacaoCountOrderByAggregateInput
    _avg?: RegistroHidratacaoAvgOrderByAggregateInput
    _max?: RegistroHidratacaoMaxOrderByAggregateInput
    _min?: RegistroHidratacaoMinOrderByAggregateInput
    _sum?: RegistroHidratacaoSumOrderByAggregateInput
  }

  export type RegistroHidratacaoScalarWhereWithAggregatesInput = {
    AND?: RegistroHidratacaoScalarWhereWithAggregatesInput | RegistroHidratacaoScalarWhereWithAggregatesInput[]
    OR?: RegistroHidratacaoScalarWhereWithAggregatesInput[]
    NOT?: RegistroHidratacaoScalarWhereWithAggregatesInput | RegistroHidratacaoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RegistroHidratacao"> | string
    data?: DateTimeWithAggregatesFilter<"RegistroHidratacao"> | Date | string
    horario?: StringWithAggregatesFilter<"RegistroHidratacao"> | string
    quantidade?: IntWithAggregatesFilter<"RegistroHidratacao"> | number
    usuarioId?: StringWithAggregatesFilter<"RegistroHidratacao"> | string
  }

  export type RegistroSonoWhereInput = {
    AND?: RegistroSonoWhereInput | RegistroSonoWhereInput[]
    OR?: RegistroSonoWhereInput[]
    NOT?: RegistroSonoWhereInput | RegistroSonoWhereInput[]
    id?: StringFilter<"RegistroSono"> | string
    inicio?: DateTimeFilter<"RegistroSono"> | Date | string
    fim?: DateTimeNullableFilter<"RegistroSono"> | Date | string | null
    qualidade?: IntNullableFilter<"RegistroSono"> | number | null
    notas?: StringNullableFilter<"RegistroSono"> | string | null
    usuarioId?: StringFilter<"RegistroSono"> | string
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
  }

  export type RegistroSonoOrderByWithRelationInput = {
    id?: SortOrder
    inicio?: SortOrder
    fim?: SortOrderInput | SortOrder
    qualidade?: SortOrderInput | SortOrder
    notas?: SortOrderInput | SortOrder
    usuarioId?: SortOrder
    usuario?: UsuarioOrderByWithRelationInput
  }

  export type RegistroSonoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RegistroSonoWhereInput | RegistroSonoWhereInput[]
    OR?: RegistroSonoWhereInput[]
    NOT?: RegistroSonoWhereInput | RegistroSonoWhereInput[]
    inicio?: DateTimeFilter<"RegistroSono"> | Date | string
    fim?: DateTimeNullableFilter<"RegistroSono"> | Date | string | null
    qualidade?: IntNullableFilter<"RegistroSono"> | number | null
    notas?: StringNullableFilter<"RegistroSono"> | string | null
    usuarioId?: StringFilter<"RegistroSono"> | string
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
  }, "id">

  export type RegistroSonoOrderByWithAggregationInput = {
    id?: SortOrder
    inicio?: SortOrder
    fim?: SortOrderInput | SortOrder
    qualidade?: SortOrderInput | SortOrder
    notas?: SortOrderInput | SortOrder
    usuarioId?: SortOrder
    _count?: RegistroSonoCountOrderByAggregateInput
    _avg?: RegistroSonoAvgOrderByAggregateInput
    _max?: RegistroSonoMaxOrderByAggregateInput
    _min?: RegistroSonoMinOrderByAggregateInput
    _sum?: RegistroSonoSumOrderByAggregateInput
  }

  export type RegistroSonoScalarWhereWithAggregatesInput = {
    AND?: RegistroSonoScalarWhereWithAggregatesInput | RegistroSonoScalarWhereWithAggregatesInput[]
    OR?: RegistroSonoScalarWhereWithAggregatesInput[]
    NOT?: RegistroSonoScalarWhereWithAggregatesInput | RegistroSonoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RegistroSono"> | string
    inicio?: DateTimeWithAggregatesFilter<"RegistroSono"> | Date | string
    fim?: DateTimeNullableWithAggregatesFilter<"RegistroSono"> | Date | string | null
    qualidade?: IntNullableWithAggregatesFilter<"RegistroSono"> | number | null
    notas?: StringNullableWithAggregatesFilter<"RegistroSono"> | string | null
    usuarioId?: StringWithAggregatesFilter<"RegistroSono"> | string
  }

  export type LembreteSonoWhereInput = {
    AND?: LembreteSonoWhereInput | LembreteSonoWhereInput[]
    OR?: LembreteSonoWhereInput[]
    NOT?: LembreteSonoWhereInput | LembreteSonoWhereInput[]
    id?: StringFilter<"LembreteSono"> | string
    tipo?: StringFilter<"LembreteSono"> | string
    horario?: StringFilter<"LembreteSono"> | string
    diasSemana?: IntNullableListFilter<"LembreteSono">
    ativo?: BoolFilter<"LembreteSono"> | boolean
    usuarioId?: StringFilter<"LembreteSono"> | string
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
  }

  export type LembreteSonoOrderByWithRelationInput = {
    id?: SortOrder
    tipo?: SortOrder
    horario?: SortOrder
    diasSemana?: SortOrder
    ativo?: SortOrder
    usuarioId?: SortOrder
    usuario?: UsuarioOrderByWithRelationInput
  }

  export type LembreteSonoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LembreteSonoWhereInput | LembreteSonoWhereInput[]
    OR?: LembreteSonoWhereInput[]
    NOT?: LembreteSonoWhereInput | LembreteSonoWhereInput[]
    tipo?: StringFilter<"LembreteSono"> | string
    horario?: StringFilter<"LembreteSono"> | string
    diasSemana?: IntNullableListFilter<"LembreteSono">
    ativo?: BoolFilter<"LembreteSono"> | boolean
    usuarioId?: StringFilter<"LembreteSono"> | string
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
  }, "id">

  export type LembreteSonoOrderByWithAggregationInput = {
    id?: SortOrder
    tipo?: SortOrder
    horario?: SortOrder
    diasSemana?: SortOrder
    ativo?: SortOrder
    usuarioId?: SortOrder
    _count?: LembreteSonoCountOrderByAggregateInput
    _avg?: LembreteSonoAvgOrderByAggregateInput
    _max?: LembreteSonoMaxOrderByAggregateInput
    _min?: LembreteSonoMinOrderByAggregateInput
    _sum?: LembreteSonoSumOrderByAggregateInput
  }

  export type LembreteSonoScalarWhereWithAggregatesInput = {
    AND?: LembreteSonoScalarWhereWithAggregatesInput | LembreteSonoScalarWhereWithAggregatesInput[]
    OR?: LembreteSonoScalarWhereWithAggregatesInput[]
    NOT?: LembreteSonoScalarWhereWithAggregatesInput | LembreteSonoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LembreteSono"> | string
    tipo?: StringWithAggregatesFilter<"LembreteSono"> | string
    horario?: StringWithAggregatesFilter<"LembreteSono"> | string
    diasSemana?: IntNullableListFilter<"LembreteSono">
    ativo?: BoolWithAggregatesFilter<"LembreteSono"> | boolean
    usuarioId?: StringWithAggregatesFilter<"LembreteSono"> | string
  }

  export type ReceitaWhereInput = {
    AND?: ReceitaWhereInput | ReceitaWhereInput[]
    OR?: ReceitaWhereInput[]
    NOT?: ReceitaWhereInput | ReceitaWhereInput[]
    id?: StringFilter<"Receita"> | string
    nome?: StringFilter<"Receita"> | string
    descricao?: StringFilter<"Receita"> | string
    categorias?: StringNullableListFilter<"Receita">
    tags?: StringNullableListFilter<"Receita">
    tempoPreparo?: IntFilter<"Receita"> | number
    porcoes?: IntFilter<"Receita"> | number
    calorias?: StringFilter<"Receita"> | string
    imagem?: StringNullableFilter<"Receita"> | string | null
    usuarioId?: StringFilter<"Receita"> | string
    ingredientes?: IngredienteListRelationFilter
    passos?: PassoReceitaListRelationFilter
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
    favoritos?: ReceitaFavoritaListRelationFilter
  }

  export type ReceitaOrderByWithRelationInput = {
    id?: SortOrder
    nome?: SortOrder
    descricao?: SortOrder
    categorias?: SortOrder
    tags?: SortOrder
    tempoPreparo?: SortOrder
    porcoes?: SortOrder
    calorias?: SortOrder
    imagem?: SortOrderInput | SortOrder
    usuarioId?: SortOrder
    ingredientes?: IngredienteOrderByRelationAggregateInput
    passos?: PassoReceitaOrderByRelationAggregateInput
    usuario?: UsuarioOrderByWithRelationInput
    favoritos?: ReceitaFavoritaOrderByRelationAggregateInput
  }

  export type ReceitaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ReceitaWhereInput | ReceitaWhereInput[]
    OR?: ReceitaWhereInput[]
    NOT?: ReceitaWhereInput | ReceitaWhereInput[]
    nome?: StringFilter<"Receita"> | string
    descricao?: StringFilter<"Receita"> | string
    categorias?: StringNullableListFilter<"Receita">
    tags?: StringNullableListFilter<"Receita">
    tempoPreparo?: IntFilter<"Receita"> | number
    porcoes?: IntFilter<"Receita"> | number
    calorias?: StringFilter<"Receita"> | string
    imagem?: StringNullableFilter<"Receita"> | string | null
    usuarioId?: StringFilter<"Receita"> | string
    ingredientes?: IngredienteListRelationFilter
    passos?: PassoReceitaListRelationFilter
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
    favoritos?: ReceitaFavoritaListRelationFilter
  }, "id">

  export type ReceitaOrderByWithAggregationInput = {
    id?: SortOrder
    nome?: SortOrder
    descricao?: SortOrder
    categorias?: SortOrder
    tags?: SortOrder
    tempoPreparo?: SortOrder
    porcoes?: SortOrder
    calorias?: SortOrder
    imagem?: SortOrderInput | SortOrder
    usuarioId?: SortOrder
    _count?: ReceitaCountOrderByAggregateInput
    _avg?: ReceitaAvgOrderByAggregateInput
    _max?: ReceitaMaxOrderByAggregateInput
    _min?: ReceitaMinOrderByAggregateInput
    _sum?: ReceitaSumOrderByAggregateInput
  }

  export type ReceitaScalarWhereWithAggregatesInput = {
    AND?: ReceitaScalarWhereWithAggregatesInput | ReceitaScalarWhereWithAggregatesInput[]
    OR?: ReceitaScalarWhereWithAggregatesInput[]
    NOT?: ReceitaScalarWhereWithAggregatesInput | ReceitaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Receita"> | string
    nome?: StringWithAggregatesFilter<"Receita"> | string
    descricao?: StringWithAggregatesFilter<"Receita"> | string
    categorias?: StringNullableListFilter<"Receita">
    tags?: StringNullableListFilter<"Receita">
    tempoPreparo?: IntWithAggregatesFilter<"Receita"> | number
    porcoes?: IntWithAggregatesFilter<"Receita"> | number
    calorias?: StringWithAggregatesFilter<"Receita"> | string
    imagem?: StringNullableWithAggregatesFilter<"Receita"> | string | null
    usuarioId?: StringWithAggregatesFilter<"Receita"> | string
  }

  export type IngredienteWhereInput = {
    AND?: IngredienteWhereInput | IngredienteWhereInput[]
    OR?: IngredienteWhereInput[]
    NOT?: IngredienteWhereInput | IngredienteWhereInput[]
    id?: StringFilter<"Ingrediente"> | string
    nome?: StringFilter<"Ingrediente"> | string
    quantidade?: FloatFilter<"Ingrediente"> | number
    unidade?: StringFilter<"Ingrediente"> | string
    receitaId?: StringFilter<"Ingrediente"> | string
    receita?: XOR<ReceitaScalarRelationFilter, ReceitaWhereInput>
  }

  export type IngredienteOrderByWithRelationInput = {
    id?: SortOrder
    nome?: SortOrder
    quantidade?: SortOrder
    unidade?: SortOrder
    receitaId?: SortOrder
    receita?: ReceitaOrderByWithRelationInput
  }

  export type IngredienteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: IngredienteWhereInput | IngredienteWhereInput[]
    OR?: IngredienteWhereInput[]
    NOT?: IngredienteWhereInput | IngredienteWhereInput[]
    nome?: StringFilter<"Ingrediente"> | string
    quantidade?: FloatFilter<"Ingrediente"> | number
    unidade?: StringFilter<"Ingrediente"> | string
    receitaId?: StringFilter<"Ingrediente"> | string
    receita?: XOR<ReceitaScalarRelationFilter, ReceitaWhereInput>
  }, "id">

  export type IngredienteOrderByWithAggregationInput = {
    id?: SortOrder
    nome?: SortOrder
    quantidade?: SortOrder
    unidade?: SortOrder
    receitaId?: SortOrder
    _count?: IngredienteCountOrderByAggregateInput
    _avg?: IngredienteAvgOrderByAggregateInput
    _max?: IngredienteMaxOrderByAggregateInput
    _min?: IngredienteMinOrderByAggregateInput
    _sum?: IngredienteSumOrderByAggregateInput
  }

  export type IngredienteScalarWhereWithAggregatesInput = {
    AND?: IngredienteScalarWhereWithAggregatesInput | IngredienteScalarWhereWithAggregatesInput[]
    OR?: IngredienteScalarWhereWithAggregatesInput[]
    NOT?: IngredienteScalarWhereWithAggregatesInput | IngredienteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Ingrediente"> | string
    nome?: StringWithAggregatesFilter<"Ingrediente"> | string
    quantidade?: FloatWithAggregatesFilter<"Ingrediente"> | number
    unidade?: StringWithAggregatesFilter<"Ingrediente"> | string
    receitaId?: StringWithAggregatesFilter<"Ingrediente"> | string
  }

  export type PassoReceitaWhereInput = {
    AND?: PassoReceitaWhereInput | PassoReceitaWhereInput[]
    OR?: PassoReceitaWhereInput[]
    NOT?: PassoReceitaWhereInput | PassoReceitaWhereInput[]
    id?: StringFilter<"PassoReceita"> | string
    ordem?: IntFilter<"PassoReceita"> | number
    descricao?: StringFilter<"PassoReceita"> | string
    receitaId?: StringFilter<"PassoReceita"> | string
    receita?: XOR<ReceitaScalarRelationFilter, ReceitaWhereInput>
  }

  export type PassoReceitaOrderByWithRelationInput = {
    id?: SortOrder
    ordem?: SortOrder
    descricao?: SortOrder
    receitaId?: SortOrder
    receita?: ReceitaOrderByWithRelationInput
  }

  export type PassoReceitaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PassoReceitaWhereInput | PassoReceitaWhereInput[]
    OR?: PassoReceitaWhereInput[]
    NOT?: PassoReceitaWhereInput | PassoReceitaWhereInput[]
    ordem?: IntFilter<"PassoReceita"> | number
    descricao?: StringFilter<"PassoReceita"> | string
    receitaId?: StringFilter<"PassoReceita"> | string
    receita?: XOR<ReceitaScalarRelationFilter, ReceitaWhereInput>
  }, "id">

  export type PassoReceitaOrderByWithAggregationInput = {
    id?: SortOrder
    ordem?: SortOrder
    descricao?: SortOrder
    receitaId?: SortOrder
    _count?: PassoReceitaCountOrderByAggregateInput
    _avg?: PassoReceitaAvgOrderByAggregateInput
    _max?: PassoReceitaMaxOrderByAggregateInput
    _min?: PassoReceitaMinOrderByAggregateInput
    _sum?: PassoReceitaSumOrderByAggregateInput
  }

  export type PassoReceitaScalarWhereWithAggregatesInput = {
    AND?: PassoReceitaScalarWhereWithAggregatesInput | PassoReceitaScalarWhereWithAggregatesInput[]
    OR?: PassoReceitaScalarWhereWithAggregatesInput[]
    NOT?: PassoReceitaScalarWhereWithAggregatesInput | PassoReceitaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PassoReceita"> | string
    ordem?: IntWithAggregatesFilter<"PassoReceita"> | number
    descricao?: StringWithAggregatesFilter<"PassoReceita"> | string
    receitaId?: StringWithAggregatesFilter<"PassoReceita"> | string
  }

  export type ReceitaFavoritaWhereInput = {
    AND?: ReceitaFavoritaWhereInput | ReceitaFavoritaWhereInput[]
    OR?: ReceitaFavoritaWhereInput[]
    NOT?: ReceitaFavoritaWhereInput | ReceitaFavoritaWhereInput[]
    id?: StringFilter<"ReceitaFavorita"> | string
    usuarioId?: StringFilter<"ReceitaFavorita"> | string
    receitaId?: StringFilter<"ReceitaFavorita"> | string
    receita?: XOR<ReceitaScalarRelationFilter, ReceitaWhereInput>
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
  }

  export type ReceitaFavoritaOrderByWithRelationInput = {
    id?: SortOrder
    usuarioId?: SortOrder
    receitaId?: SortOrder
    receita?: ReceitaOrderByWithRelationInput
    usuario?: UsuarioOrderByWithRelationInput
  }

  export type ReceitaFavoritaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    usuarioId_receitaId?: ReceitaFavoritaUsuarioIdReceitaIdCompoundUniqueInput
    AND?: ReceitaFavoritaWhereInput | ReceitaFavoritaWhereInput[]
    OR?: ReceitaFavoritaWhereInput[]
    NOT?: ReceitaFavoritaWhereInput | ReceitaFavoritaWhereInput[]
    usuarioId?: StringFilter<"ReceitaFavorita"> | string
    receitaId?: StringFilter<"ReceitaFavorita"> | string
    receita?: XOR<ReceitaScalarRelationFilter, ReceitaWhereInput>
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
  }, "id" | "usuarioId_receitaId">

  export type ReceitaFavoritaOrderByWithAggregationInput = {
    id?: SortOrder
    usuarioId?: SortOrder
    receitaId?: SortOrder
    _count?: ReceitaFavoritaCountOrderByAggregateInput
    _max?: ReceitaFavoritaMaxOrderByAggregateInput
    _min?: ReceitaFavoritaMinOrderByAggregateInput
  }

  export type ReceitaFavoritaScalarWhereWithAggregatesInput = {
    AND?: ReceitaFavoritaScalarWhereWithAggregatesInput | ReceitaFavoritaScalarWhereWithAggregatesInput[]
    OR?: ReceitaFavoritaScalarWhereWithAggregatesInput[]
    NOT?: ReceitaFavoritaScalarWhereWithAggregatesInput | ReceitaFavoritaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ReceitaFavorita"> | string
    usuarioId?: StringWithAggregatesFilter<"ReceitaFavorita"> | string
    receitaId?: StringWithAggregatesFilter<"ReceitaFavorita"> | string
  }

  export type UsuarioCreateInput = {
    id?: string
    email: string
    nome: string
    createdAt?: Date | string
    updatedAt?: Date | string
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: number
    metaTarefasPrioritarias?: number
    metaCoposAgua?: number
    metaPausasProgramadas?: number
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
    lembretesSono?: LembreteSonoCreateNestedManyWithoutUsuarioInput
    receitas?: ReceitaCreateNestedManyWithoutUsuarioInput
    receitasFavoritas?: ReceitaFavoritaCreateNestedManyWithoutUsuarioInput
    refeicoes?: RefeicaoCreateNestedManyWithoutUsuarioInput
    registrosRefeicao?: RegistroRefeicaoCreateNestedManyWithoutUsuarioInput
    registrosSono?: RegistroSonoCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateInput = {
    id?: string
    email: string
    nome: string
    createdAt?: Date | string
    updatedAt?: Date | string
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: number
    metaTarefasPrioritarias?: number
    metaCoposAgua?: number
    metaPausasProgramadas?: number
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
    lembretesSono?: LembreteSonoUncheckedCreateNestedManyWithoutUsuarioInput
    receitas?: ReceitaUncheckedCreateNestedManyWithoutUsuarioInput
    receitasFavoritas?: ReceitaFavoritaUncheckedCreateNestedManyWithoutUsuarioInput
    refeicoes?: RefeicaoUncheckedCreateNestedManyWithoutUsuarioInput
    registrosRefeicao?: RegistroRefeicaoUncheckedCreateNestedManyWithoutUsuarioInput
    registrosSono?: RegistroSonoUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    altoContraste?: BoolFieldUpdateOperationsInput | boolean
    reducaoEstimulos?: BoolFieldUpdateOperationsInput | boolean
    textoGrande?: BoolFieldUpdateOperationsInput | boolean
    metaHorasSono?: IntFieldUpdateOperationsInput | number
    metaTarefasPrioritarias?: IntFieldUpdateOperationsInput | number
    metaCoposAgua?: IntFieldUpdateOperationsInput | number
    metaPausasProgramadas?: IntFieldUpdateOperationsInput | number
    notificacoesAtivas?: BoolFieldUpdateOperationsInput | boolean
    pausasAtivas?: BoolFieldUpdateOperationsInput | boolean
    lembretesSono?: LembreteSonoUpdateManyWithoutUsuarioNestedInput
    receitas?: ReceitaUpdateManyWithoutUsuarioNestedInput
    receitasFavoritas?: ReceitaFavoritaUpdateManyWithoutUsuarioNestedInput
    refeicoes?: RefeicaoUpdateManyWithoutUsuarioNestedInput
    registrosRefeicao?: RegistroRefeicaoUpdateManyWithoutUsuarioNestedInput
    registrosSono?: RegistroSonoUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    altoContraste?: BoolFieldUpdateOperationsInput | boolean
    reducaoEstimulos?: BoolFieldUpdateOperationsInput | boolean
    textoGrande?: BoolFieldUpdateOperationsInput | boolean
    metaHorasSono?: IntFieldUpdateOperationsInput | number
    metaTarefasPrioritarias?: IntFieldUpdateOperationsInput | number
    metaCoposAgua?: IntFieldUpdateOperationsInput | number
    metaPausasProgramadas?: IntFieldUpdateOperationsInput | number
    notificacoesAtivas?: BoolFieldUpdateOperationsInput | boolean
    pausasAtivas?: BoolFieldUpdateOperationsInput | boolean
    lembretesSono?: LembreteSonoUncheckedUpdateManyWithoutUsuarioNestedInput
    receitas?: ReceitaUncheckedUpdateManyWithoutUsuarioNestedInput
    receitasFavoritas?: ReceitaFavoritaUncheckedUpdateManyWithoutUsuarioNestedInput
    refeicoes?: RefeicaoUncheckedUpdateManyWithoutUsuarioNestedInput
    registrosRefeicao?: RegistroRefeicaoUncheckedUpdateManyWithoutUsuarioNestedInput
    registrosSono?: RegistroSonoUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioCreateManyInput = {
    id?: string
    email: string
    nome: string
    createdAt?: Date | string
    updatedAt?: Date | string
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: number
    metaTarefasPrioritarias?: number
    metaCoposAgua?: number
    metaPausasProgramadas?: number
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
  }

  export type UsuarioUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    altoContraste?: BoolFieldUpdateOperationsInput | boolean
    reducaoEstimulos?: BoolFieldUpdateOperationsInput | boolean
    textoGrande?: BoolFieldUpdateOperationsInput | boolean
    metaHorasSono?: IntFieldUpdateOperationsInput | number
    metaTarefasPrioritarias?: IntFieldUpdateOperationsInput | number
    metaCoposAgua?: IntFieldUpdateOperationsInput | number
    metaPausasProgramadas?: IntFieldUpdateOperationsInput | number
    notificacoesAtivas?: BoolFieldUpdateOperationsInput | boolean
    pausasAtivas?: BoolFieldUpdateOperationsInput | boolean
  }

  export type UsuarioUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    altoContraste?: BoolFieldUpdateOperationsInput | boolean
    reducaoEstimulos?: BoolFieldUpdateOperationsInput | boolean
    textoGrande?: BoolFieldUpdateOperationsInput | boolean
    metaHorasSono?: IntFieldUpdateOperationsInput | number
    metaTarefasPrioritarias?: IntFieldUpdateOperationsInput | number
    metaCoposAgua?: IntFieldUpdateOperationsInput | number
    metaPausasProgramadas?: IntFieldUpdateOperationsInput | number
    notificacoesAtivas?: BoolFieldUpdateOperationsInput | boolean
    pausasAtivas?: BoolFieldUpdateOperationsInput | boolean
  }

  export type RefeicaoCreateInput = {
    id?: string
    horario: string
    descricao: string
    usuario: UsuarioCreateNestedOneWithoutRefeicoesInput
  }

  export type RefeicaoUncheckedCreateInput = {
    id?: string
    horario: string
    descricao: string
    usuarioId: string
  }

  export type RefeicaoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    horario?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    usuario?: UsuarioUpdateOneRequiredWithoutRefeicoesNestedInput
  }

  export type RefeicaoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    horario?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    usuarioId?: StringFieldUpdateOperationsInput | string
  }

  export type RefeicaoCreateManyInput = {
    id?: string
    horario: string
    descricao: string
    usuarioId: string
  }

  export type RefeicaoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    horario?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
  }

  export type RefeicaoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    horario?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    usuarioId?: StringFieldUpdateOperationsInput | string
  }

  export type RegistroRefeicaoCreateInput = {
    id?: string
    data: Date | string
    horario: string
    descricao: string
    tipoIcone?: string | null
    foto?: string | null
    usuario: UsuarioCreateNestedOneWithoutRegistrosRefeicaoInput
  }

  export type RegistroRefeicaoUncheckedCreateInput = {
    id?: string
    data: Date | string
    horario: string
    descricao: string
    tipoIcone?: string | null
    foto?: string | null
    usuarioId: string
  }

  export type RegistroRefeicaoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: DateTimeFieldUpdateOperationsInput | Date | string
    horario?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    tipoIcone?: NullableStringFieldUpdateOperationsInput | string | null
    foto?: NullableStringFieldUpdateOperationsInput | string | null
    usuario?: UsuarioUpdateOneRequiredWithoutRegistrosRefeicaoNestedInput
  }

  export type RegistroRefeicaoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: DateTimeFieldUpdateOperationsInput | Date | string
    horario?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    tipoIcone?: NullableStringFieldUpdateOperationsInput | string | null
    foto?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
  }

  export type RegistroRefeicaoCreateManyInput = {
    id?: string
    data: Date | string
    horario: string
    descricao: string
    tipoIcone?: string | null
    foto?: string | null
    usuarioId: string
  }

  export type RegistroRefeicaoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: DateTimeFieldUpdateOperationsInput | Date | string
    horario?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    tipoIcone?: NullableStringFieldUpdateOperationsInput | string | null
    foto?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RegistroRefeicaoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: DateTimeFieldUpdateOperationsInput | Date | string
    horario?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    tipoIcone?: NullableStringFieldUpdateOperationsInput | string | null
    foto?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
  }

  export type RegistroHidratacaoCreateInput = {
    id?: string
    data?: Date | string
    horario: string
    quantidade: number
    usuarioId: string
  }

  export type RegistroHidratacaoUncheckedCreateInput = {
    id?: string
    data?: Date | string
    horario: string
    quantidade: number
    usuarioId: string
  }

  export type RegistroHidratacaoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: DateTimeFieldUpdateOperationsInput | Date | string
    horario?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    usuarioId?: StringFieldUpdateOperationsInput | string
  }

  export type RegistroHidratacaoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: DateTimeFieldUpdateOperationsInput | Date | string
    horario?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    usuarioId?: StringFieldUpdateOperationsInput | string
  }

  export type RegistroHidratacaoCreateManyInput = {
    id?: string
    data?: Date | string
    horario: string
    quantidade: number
    usuarioId: string
  }

  export type RegistroHidratacaoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: DateTimeFieldUpdateOperationsInput | Date | string
    horario?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    usuarioId?: StringFieldUpdateOperationsInput | string
  }

  export type RegistroHidratacaoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: DateTimeFieldUpdateOperationsInput | Date | string
    horario?: StringFieldUpdateOperationsInput | string
    quantidade?: IntFieldUpdateOperationsInput | number
    usuarioId?: StringFieldUpdateOperationsInput | string
  }

  export type RegistroSonoCreateInput = {
    id?: string
    inicio: Date | string
    fim?: Date | string | null
    qualidade?: number | null
    notas?: string | null
    usuario: UsuarioCreateNestedOneWithoutRegistrosSonoInput
  }

  export type RegistroSonoUncheckedCreateInput = {
    id?: string
    inicio: Date | string
    fim?: Date | string | null
    qualidade?: number | null
    notas?: string | null
    usuarioId: string
  }

  export type RegistroSonoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fim?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    qualidade?: NullableIntFieldUpdateOperationsInput | number | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    usuario?: UsuarioUpdateOneRequiredWithoutRegistrosSonoNestedInput
  }

  export type RegistroSonoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fim?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    qualidade?: NullableIntFieldUpdateOperationsInput | number | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
  }

  export type RegistroSonoCreateManyInput = {
    id?: string
    inicio: Date | string
    fim?: Date | string | null
    qualidade?: number | null
    notas?: string | null
    usuarioId: string
  }

  export type RegistroSonoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fim?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    qualidade?: NullableIntFieldUpdateOperationsInput | number | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RegistroSonoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fim?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    qualidade?: NullableIntFieldUpdateOperationsInput | number | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
  }

  export type LembreteSonoCreateInput = {
    id?: string
    tipo: string
    horario: string
    diasSemana?: LembreteSonoCreatediasSemanaInput | number[]
    ativo?: boolean
    usuario: UsuarioCreateNestedOneWithoutLembretesSonoInput
  }

  export type LembreteSonoUncheckedCreateInput = {
    id?: string
    tipo: string
    horario: string
    diasSemana?: LembreteSonoCreatediasSemanaInput | number[]
    ativo?: boolean
    usuarioId: string
  }

  export type LembreteSonoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    horario?: StringFieldUpdateOperationsInput | string
    diasSemana?: LembreteSonoUpdatediasSemanaInput | number[]
    ativo?: BoolFieldUpdateOperationsInput | boolean
    usuario?: UsuarioUpdateOneRequiredWithoutLembretesSonoNestedInput
  }

  export type LembreteSonoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    horario?: StringFieldUpdateOperationsInput | string
    diasSemana?: LembreteSonoUpdatediasSemanaInput | number[]
    ativo?: BoolFieldUpdateOperationsInput | boolean
    usuarioId?: StringFieldUpdateOperationsInput | string
  }

  export type LembreteSonoCreateManyInput = {
    id?: string
    tipo: string
    horario: string
    diasSemana?: LembreteSonoCreatediasSemanaInput | number[]
    ativo?: boolean
    usuarioId: string
  }

  export type LembreteSonoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    horario?: StringFieldUpdateOperationsInput | string
    diasSemana?: LembreteSonoUpdatediasSemanaInput | number[]
    ativo?: BoolFieldUpdateOperationsInput | boolean
  }

  export type LembreteSonoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    horario?: StringFieldUpdateOperationsInput | string
    diasSemana?: LembreteSonoUpdatediasSemanaInput | number[]
    ativo?: BoolFieldUpdateOperationsInput | boolean
    usuarioId?: StringFieldUpdateOperationsInput | string
  }

  export type ReceitaCreateInput = {
    id?: string
    nome: string
    descricao: string
    categorias?: ReceitaCreatecategoriasInput | string[]
    tags?: ReceitaCreatetagsInput | string[]
    tempoPreparo: number
    porcoes: number
    calorias: string
    imagem?: string | null
    ingredientes?: IngredienteCreateNestedManyWithoutReceitaInput
    passos?: PassoReceitaCreateNestedManyWithoutReceitaInput
    usuario: UsuarioCreateNestedOneWithoutReceitasInput
    favoritos?: ReceitaFavoritaCreateNestedManyWithoutReceitaInput
  }

  export type ReceitaUncheckedCreateInput = {
    id?: string
    nome: string
    descricao: string
    categorias?: ReceitaCreatecategoriasInput | string[]
    tags?: ReceitaCreatetagsInput | string[]
    tempoPreparo: number
    porcoes: number
    calorias: string
    imagem?: string | null
    usuarioId: string
    ingredientes?: IngredienteUncheckedCreateNestedManyWithoutReceitaInput
    passos?: PassoReceitaUncheckedCreateNestedManyWithoutReceitaInput
    favoritos?: ReceitaFavoritaUncheckedCreateNestedManyWithoutReceitaInput
  }

  export type ReceitaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    categorias?: ReceitaUpdatecategoriasInput | string[]
    tags?: ReceitaUpdatetagsInput | string[]
    tempoPreparo?: IntFieldUpdateOperationsInput | number
    porcoes?: IntFieldUpdateOperationsInput | number
    calorias?: StringFieldUpdateOperationsInput | string
    imagem?: NullableStringFieldUpdateOperationsInput | string | null
    ingredientes?: IngredienteUpdateManyWithoutReceitaNestedInput
    passos?: PassoReceitaUpdateManyWithoutReceitaNestedInput
    usuario?: UsuarioUpdateOneRequiredWithoutReceitasNestedInput
    favoritos?: ReceitaFavoritaUpdateManyWithoutReceitaNestedInput
  }

  export type ReceitaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    categorias?: ReceitaUpdatecategoriasInput | string[]
    tags?: ReceitaUpdatetagsInput | string[]
    tempoPreparo?: IntFieldUpdateOperationsInput | number
    porcoes?: IntFieldUpdateOperationsInput | number
    calorias?: StringFieldUpdateOperationsInput | string
    imagem?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
    ingredientes?: IngredienteUncheckedUpdateManyWithoutReceitaNestedInput
    passos?: PassoReceitaUncheckedUpdateManyWithoutReceitaNestedInput
    favoritos?: ReceitaFavoritaUncheckedUpdateManyWithoutReceitaNestedInput
  }

  export type ReceitaCreateManyInput = {
    id?: string
    nome: string
    descricao: string
    categorias?: ReceitaCreatecategoriasInput | string[]
    tags?: ReceitaCreatetagsInput | string[]
    tempoPreparo: number
    porcoes: number
    calorias: string
    imagem?: string | null
    usuarioId: string
  }

  export type ReceitaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    categorias?: ReceitaUpdatecategoriasInput | string[]
    tags?: ReceitaUpdatetagsInput | string[]
    tempoPreparo?: IntFieldUpdateOperationsInput | number
    porcoes?: IntFieldUpdateOperationsInput | number
    calorias?: StringFieldUpdateOperationsInput | string
    imagem?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ReceitaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    categorias?: ReceitaUpdatecategoriasInput | string[]
    tags?: ReceitaUpdatetagsInput | string[]
    tempoPreparo?: IntFieldUpdateOperationsInput | number
    porcoes?: IntFieldUpdateOperationsInput | number
    calorias?: StringFieldUpdateOperationsInput | string
    imagem?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
  }

  export type IngredienteCreateInput = {
    id?: string
    nome: string
    quantidade: number
    unidade: string
    receita: ReceitaCreateNestedOneWithoutIngredientesInput
  }

  export type IngredienteUncheckedCreateInput = {
    id?: string
    nome: string
    quantidade: number
    unidade: string
    receitaId: string
  }

  export type IngredienteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    quantidade?: FloatFieldUpdateOperationsInput | number
    unidade?: StringFieldUpdateOperationsInput | string
    receita?: ReceitaUpdateOneRequiredWithoutIngredientesNestedInput
  }

  export type IngredienteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    quantidade?: FloatFieldUpdateOperationsInput | number
    unidade?: StringFieldUpdateOperationsInput | string
    receitaId?: StringFieldUpdateOperationsInput | string
  }

  export type IngredienteCreateManyInput = {
    id?: string
    nome: string
    quantidade: number
    unidade: string
    receitaId: string
  }

  export type IngredienteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    quantidade?: FloatFieldUpdateOperationsInput | number
    unidade?: StringFieldUpdateOperationsInput | string
  }

  export type IngredienteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    quantidade?: FloatFieldUpdateOperationsInput | number
    unidade?: StringFieldUpdateOperationsInput | string
    receitaId?: StringFieldUpdateOperationsInput | string
  }

  export type PassoReceitaCreateInput = {
    id?: string
    ordem: number
    descricao: string
    receita: ReceitaCreateNestedOneWithoutPassosInput
  }

  export type PassoReceitaUncheckedCreateInput = {
    id?: string
    ordem: number
    descricao: string
    receitaId: string
  }

  export type PassoReceitaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ordem?: IntFieldUpdateOperationsInput | number
    descricao?: StringFieldUpdateOperationsInput | string
    receita?: ReceitaUpdateOneRequiredWithoutPassosNestedInput
  }

  export type PassoReceitaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ordem?: IntFieldUpdateOperationsInput | number
    descricao?: StringFieldUpdateOperationsInput | string
    receitaId?: StringFieldUpdateOperationsInput | string
  }

  export type PassoReceitaCreateManyInput = {
    id?: string
    ordem: number
    descricao: string
    receitaId: string
  }

  export type PassoReceitaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    ordem?: IntFieldUpdateOperationsInput | number
    descricao?: StringFieldUpdateOperationsInput | string
  }

  export type PassoReceitaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    ordem?: IntFieldUpdateOperationsInput | number
    descricao?: StringFieldUpdateOperationsInput | string
    receitaId?: StringFieldUpdateOperationsInput | string
  }

  export type ReceitaFavoritaCreateInput = {
    id?: string
    receita: ReceitaCreateNestedOneWithoutFavoritosInput
    usuario: UsuarioCreateNestedOneWithoutReceitasFavoritasInput
  }

  export type ReceitaFavoritaUncheckedCreateInput = {
    id?: string
    usuarioId: string
    receitaId: string
  }

  export type ReceitaFavoritaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    receita?: ReceitaUpdateOneRequiredWithoutFavoritosNestedInput
    usuario?: UsuarioUpdateOneRequiredWithoutReceitasFavoritasNestedInput
  }

  export type ReceitaFavoritaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    usuarioId?: StringFieldUpdateOperationsInput | string
    receitaId?: StringFieldUpdateOperationsInput | string
  }

  export type ReceitaFavoritaCreateManyInput = {
    id?: string
    usuarioId: string
    receitaId: string
  }

  export type ReceitaFavoritaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
  }

  export type ReceitaFavoritaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    usuarioId?: StringFieldUpdateOperationsInput | string
    receitaId?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type LembreteSonoListRelationFilter = {
    every?: LembreteSonoWhereInput
    some?: LembreteSonoWhereInput
    none?: LembreteSonoWhereInput
  }

  export type ReceitaListRelationFilter = {
    every?: ReceitaWhereInput
    some?: ReceitaWhereInput
    none?: ReceitaWhereInput
  }

  export type ReceitaFavoritaListRelationFilter = {
    every?: ReceitaFavoritaWhereInput
    some?: ReceitaFavoritaWhereInput
    none?: ReceitaFavoritaWhereInput
  }

  export type RefeicaoListRelationFilter = {
    every?: RefeicaoWhereInput
    some?: RefeicaoWhereInput
    none?: RefeicaoWhereInput
  }

  export type RegistroRefeicaoListRelationFilter = {
    every?: RegistroRefeicaoWhereInput
    some?: RegistroRefeicaoWhereInput
    none?: RegistroRefeicaoWhereInput
  }

  export type RegistroSonoListRelationFilter = {
    every?: RegistroSonoWhereInput
    some?: RegistroSonoWhereInput
    none?: RegistroSonoWhereInput
  }

  export type LembreteSonoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReceitaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReceitaFavoritaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RefeicaoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RegistroRefeicaoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RegistroSonoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UsuarioCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    nome?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    altoContraste?: SortOrder
    reducaoEstimulos?: SortOrder
    textoGrande?: SortOrder
    metaHorasSono?: SortOrder
    metaTarefasPrioritarias?: SortOrder
    metaCoposAgua?: SortOrder
    metaPausasProgramadas?: SortOrder
    notificacoesAtivas?: SortOrder
    pausasAtivas?: SortOrder
  }

  export type UsuarioAvgOrderByAggregateInput = {
    metaHorasSono?: SortOrder
    metaTarefasPrioritarias?: SortOrder
    metaCoposAgua?: SortOrder
    metaPausasProgramadas?: SortOrder
  }

  export type UsuarioMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    nome?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    altoContraste?: SortOrder
    reducaoEstimulos?: SortOrder
    textoGrande?: SortOrder
    metaHorasSono?: SortOrder
    metaTarefasPrioritarias?: SortOrder
    metaCoposAgua?: SortOrder
    metaPausasProgramadas?: SortOrder
    notificacoesAtivas?: SortOrder
    pausasAtivas?: SortOrder
  }

  export type UsuarioMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    nome?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    altoContraste?: SortOrder
    reducaoEstimulos?: SortOrder
    textoGrande?: SortOrder
    metaHorasSono?: SortOrder
    metaTarefasPrioritarias?: SortOrder
    metaCoposAgua?: SortOrder
    metaPausasProgramadas?: SortOrder
    notificacoesAtivas?: SortOrder
    pausasAtivas?: SortOrder
  }

  export type UsuarioSumOrderByAggregateInput = {
    metaHorasSono?: SortOrder
    metaTarefasPrioritarias?: SortOrder
    metaCoposAgua?: SortOrder
    metaPausasProgramadas?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type UsuarioScalarRelationFilter = {
    is?: UsuarioWhereInput
    isNot?: UsuarioWhereInput
  }

  export type RefeicaoCountOrderByAggregateInput = {
    id?: SortOrder
    horario?: SortOrder
    descricao?: SortOrder
    usuarioId?: SortOrder
  }

  export type RefeicaoMaxOrderByAggregateInput = {
    id?: SortOrder
    horario?: SortOrder
    descricao?: SortOrder
    usuarioId?: SortOrder
  }

  export type RefeicaoMinOrderByAggregateInput = {
    id?: SortOrder
    horario?: SortOrder
    descricao?: SortOrder
    usuarioId?: SortOrder
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type RegistroRefeicaoCountOrderByAggregateInput = {
    id?: SortOrder
    data?: SortOrder
    horario?: SortOrder
    descricao?: SortOrder
    tipoIcone?: SortOrder
    foto?: SortOrder
    usuarioId?: SortOrder
  }

  export type RegistroRefeicaoMaxOrderByAggregateInput = {
    id?: SortOrder
    data?: SortOrder
    horario?: SortOrder
    descricao?: SortOrder
    tipoIcone?: SortOrder
    foto?: SortOrder
    usuarioId?: SortOrder
  }

  export type RegistroRefeicaoMinOrderByAggregateInput = {
    id?: SortOrder
    data?: SortOrder
    horario?: SortOrder
    descricao?: SortOrder
    tipoIcone?: SortOrder
    foto?: SortOrder
    usuarioId?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type RegistroHidratacaoCountOrderByAggregateInput = {
    id?: SortOrder
    data?: SortOrder
    horario?: SortOrder
    quantidade?: SortOrder
    usuarioId?: SortOrder
  }

  export type RegistroHidratacaoAvgOrderByAggregateInput = {
    quantidade?: SortOrder
  }

  export type RegistroHidratacaoMaxOrderByAggregateInput = {
    id?: SortOrder
    data?: SortOrder
    horario?: SortOrder
    quantidade?: SortOrder
    usuarioId?: SortOrder
  }

  export type RegistroHidratacaoMinOrderByAggregateInput = {
    id?: SortOrder
    data?: SortOrder
    horario?: SortOrder
    quantidade?: SortOrder
    usuarioId?: SortOrder
  }

  export type RegistroHidratacaoSumOrderByAggregateInput = {
    quantidade?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type RegistroSonoCountOrderByAggregateInput = {
    id?: SortOrder
    inicio?: SortOrder
    fim?: SortOrder
    qualidade?: SortOrder
    notas?: SortOrder
    usuarioId?: SortOrder
  }

  export type RegistroSonoAvgOrderByAggregateInput = {
    qualidade?: SortOrder
  }

  export type RegistroSonoMaxOrderByAggregateInput = {
    id?: SortOrder
    inicio?: SortOrder
    fim?: SortOrder
    qualidade?: SortOrder
    notas?: SortOrder
    usuarioId?: SortOrder
  }

  export type RegistroSonoMinOrderByAggregateInput = {
    id?: SortOrder
    inicio?: SortOrder
    fim?: SortOrder
    qualidade?: SortOrder
    notas?: SortOrder
    usuarioId?: SortOrder
  }

  export type RegistroSonoSumOrderByAggregateInput = {
    qualidade?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type IntNullableListFilter<$PrismaModel = never> = {
    equals?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    has?: number | IntFieldRefInput<$PrismaModel> | null
    hasEvery?: number[] | ListIntFieldRefInput<$PrismaModel>
    hasSome?: number[] | ListIntFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type LembreteSonoCountOrderByAggregateInput = {
    id?: SortOrder
    tipo?: SortOrder
    horario?: SortOrder
    diasSemana?: SortOrder
    ativo?: SortOrder
    usuarioId?: SortOrder
  }

  export type LembreteSonoAvgOrderByAggregateInput = {
    diasSemana?: SortOrder
  }

  export type LembreteSonoMaxOrderByAggregateInput = {
    id?: SortOrder
    tipo?: SortOrder
    horario?: SortOrder
    ativo?: SortOrder
    usuarioId?: SortOrder
  }

  export type LembreteSonoMinOrderByAggregateInput = {
    id?: SortOrder
    tipo?: SortOrder
    horario?: SortOrder
    ativo?: SortOrder
    usuarioId?: SortOrder
  }

  export type LembreteSonoSumOrderByAggregateInput = {
    diasSemana?: SortOrder
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type IngredienteListRelationFilter = {
    every?: IngredienteWhereInput
    some?: IngredienteWhereInput
    none?: IngredienteWhereInput
  }

  export type PassoReceitaListRelationFilter = {
    every?: PassoReceitaWhereInput
    some?: PassoReceitaWhereInput
    none?: PassoReceitaWhereInput
  }

  export type IngredienteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PassoReceitaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReceitaCountOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    descricao?: SortOrder
    categorias?: SortOrder
    tags?: SortOrder
    tempoPreparo?: SortOrder
    porcoes?: SortOrder
    calorias?: SortOrder
    imagem?: SortOrder
    usuarioId?: SortOrder
  }

  export type ReceitaAvgOrderByAggregateInput = {
    tempoPreparo?: SortOrder
    porcoes?: SortOrder
  }

  export type ReceitaMaxOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    descricao?: SortOrder
    tempoPreparo?: SortOrder
    porcoes?: SortOrder
    calorias?: SortOrder
    imagem?: SortOrder
    usuarioId?: SortOrder
  }

  export type ReceitaMinOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    descricao?: SortOrder
    tempoPreparo?: SortOrder
    porcoes?: SortOrder
    calorias?: SortOrder
    imagem?: SortOrder
    usuarioId?: SortOrder
  }

  export type ReceitaSumOrderByAggregateInput = {
    tempoPreparo?: SortOrder
    porcoes?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type ReceitaScalarRelationFilter = {
    is?: ReceitaWhereInput
    isNot?: ReceitaWhereInput
  }

  export type IngredienteCountOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    quantidade?: SortOrder
    unidade?: SortOrder
    receitaId?: SortOrder
  }

  export type IngredienteAvgOrderByAggregateInput = {
    quantidade?: SortOrder
  }

  export type IngredienteMaxOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    quantidade?: SortOrder
    unidade?: SortOrder
    receitaId?: SortOrder
  }

  export type IngredienteMinOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    quantidade?: SortOrder
    unidade?: SortOrder
    receitaId?: SortOrder
  }

  export type IngredienteSumOrderByAggregateInput = {
    quantidade?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type PassoReceitaCountOrderByAggregateInput = {
    id?: SortOrder
    ordem?: SortOrder
    descricao?: SortOrder
    receitaId?: SortOrder
  }

  export type PassoReceitaAvgOrderByAggregateInput = {
    ordem?: SortOrder
  }

  export type PassoReceitaMaxOrderByAggregateInput = {
    id?: SortOrder
    ordem?: SortOrder
    descricao?: SortOrder
    receitaId?: SortOrder
  }

  export type PassoReceitaMinOrderByAggregateInput = {
    id?: SortOrder
    ordem?: SortOrder
    descricao?: SortOrder
    receitaId?: SortOrder
  }

  export type PassoReceitaSumOrderByAggregateInput = {
    ordem?: SortOrder
  }

  export type ReceitaFavoritaUsuarioIdReceitaIdCompoundUniqueInput = {
    usuarioId: string
    receitaId: string
  }

  export type ReceitaFavoritaCountOrderByAggregateInput = {
    id?: SortOrder
    usuarioId?: SortOrder
    receitaId?: SortOrder
  }

  export type ReceitaFavoritaMaxOrderByAggregateInput = {
    id?: SortOrder
    usuarioId?: SortOrder
    receitaId?: SortOrder
  }

  export type ReceitaFavoritaMinOrderByAggregateInput = {
    id?: SortOrder
    usuarioId?: SortOrder
    receitaId?: SortOrder
  }

  export type LembreteSonoCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<LembreteSonoCreateWithoutUsuarioInput, LembreteSonoUncheckedCreateWithoutUsuarioInput> | LembreteSonoCreateWithoutUsuarioInput[] | LembreteSonoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: LembreteSonoCreateOrConnectWithoutUsuarioInput | LembreteSonoCreateOrConnectWithoutUsuarioInput[]
    createMany?: LembreteSonoCreateManyUsuarioInputEnvelope
    connect?: LembreteSonoWhereUniqueInput | LembreteSonoWhereUniqueInput[]
  }

  export type ReceitaCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<ReceitaCreateWithoutUsuarioInput, ReceitaUncheckedCreateWithoutUsuarioInput> | ReceitaCreateWithoutUsuarioInput[] | ReceitaUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: ReceitaCreateOrConnectWithoutUsuarioInput | ReceitaCreateOrConnectWithoutUsuarioInput[]
    createMany?: ReceitaCreateManyUsuarioInputEnvelope
    connect?: ReceitaWhereUniqueInput | ReceitaWhereUniqueInput[]
  }

  export type ReceitaFavoritaCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<ReceitaFavoritaCreateWithoutUsuarioInput, ReceitaFavoritaUncheckedCreateWithoutUsuarioInput> | ReceitaFavoritaCreateWithoutUsuarioInput[] | ReceitaFavoritaUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: ReceitaFavoritaCreateOrConnectWithoutUsuarioInput | ReceitaFavoritaCreateOrConnectWithoutUsuarioInput[]
    createMany?: ReceitaFavoritaCreateManyUsuarioInputEnvelope
    connect?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
  }

  export type RefeicaoCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<RefeicaoCreateWithoutUsuarioInput, RefeicaoUncheckedCreateWithoutUsuarioInput> | RefeicaoCreateWithoutUsuarioInput[] | RefeicaoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: RefeicaoCreateOrConnectWithoutUsuarioInput | RefeicaoCreateOrConnectWithoutUsuarioInput[]
    createMany?: RefeicaoCreateManyUsuarioInputEnvelope
    connect?: RefeicaoWhereUniqueInput | RefeicaoWhereUniqueInput[]
  }

  export type RegistroRefeicaoCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<RegistroRefeicaoCreateWithoutUsuarioInput, RegistroRefeicaoUncheckedCreateWithoutUsuarioInput> | RegistroRefeicaoCreateWithoutUsuarioInput[] | RegistroRefeicaoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: RegistroRefeicaoCreateOrConnectWithoutUsuarioInput | RegistroRefeicaoCreateOrConnectWithoutUsuarioInput[]
    createMany?: RegistroRefeicaoCreateManyUsuarioInputEnvelope
    connect?: RegistroRefeicaoWhereUniqueInput | RegistroRefeicaoWhereUniqueInput[]
  }

  export type RegistroSonoCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<RegistroSonoCreateWithoutUsuarioInput, RegistroSonoUncheckedCreateWithoutUsuarioInput> | RegistroSonoCreateWithoutUsuarioInput[] | RegistroSonoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: RegistroSonoCreateOrConnectWithoutUsuarioInput | RegistroSonoCreateOrConnectWithoutUsuarioInput[]
    createMany?: RegistroSonoCreateManyUsuarioInputEnvelope
    connect?: RegistroSonoWhereUniqueInput | RegistroSonoWhereUniqueInput[]
  }

  export type LembreteSonoUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<LembreteSonoCreateWithoutUsuarioInput, LembreteSonoUncheckedCreateWithoutUsuarioInput> | LembreteSonoCreateWithoutUsuarioInput[] | LembreteSonoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: LembreteSonoCreateOrConnectWithoutUsuarioInput | LembreteSonoCreateOrConnectWithoutUsuarioInput[]
    createMany?: LembreteSonoCreateManyUsuarioInputEnvelope
    connect?: LembreteSonoWhereUniqueInput | LembreteSonoWhereUniqueInput[]
  }

  export type ReceitaUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<ReceitaCreateWithoutUsuarioInput, ReceitaUncheckedCreateWithoutUsuarioInput> | ReceitaCreateWithoutUsuarioInput[] | ReceitaUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: ReceitaCreateOrConnectWithoutUsuarioInput | ReceitaCreateOrConnectWithoutUsuarioInput[]
    createMany?: ReceitaCreateManyUsuarioInputEnvelope
    connect?: ReceitaWhereUniqueInput | ReceitaWhereUniqueInput[]
  }

  export type ReceitaFavoritaUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<ReceitaFavoritaCreateWithoutUsuarioInput, ReceitaFavoritaUncheckedCreateWithoutUsuarioInput> | ReceitaFavoritaCreateWithoutUsuarioInput[] | ReceitaFavoritaUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: ReceitaFavoritaCreateOrConnectWithoutUsuarioInput | ReceitaFavoritaCreateOrConnectWithoutUsuarioInput[]
    createMany?: ReceitaFavoritaCreateManyUsuarioInputEnvelope
    connect?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
  }

  export type RefeicaoUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<RefeicaoCreateWithoutUsuarioInput, RefeicaoUncheckedCreateWithoutUsuarioInput> | RefeicaoCreateWithoutUsuarioInput[] | RefeicaoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: RefeicaoCreateOrConnectWithoutUsuarioInput | RefeicaoCreateOrConnectWithoutUsuarioInput[]
    createMany?: RefeicaoCreateManyUsuarioInputEnvelope
    connect?: RefeicaoWhereUniqueInput | RefeicaoWhereUniqueInput[]
  }

  export type RegistroRefeicaoUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<RegistroRefeicaoCreateWithoutUsuarioInput, RegistroRefeicaoUncheckedCreateWithoutUsuarioInput> | RegistroRefeicaoCreateWithoutUsuarioInput[] | RegistroRefeicaoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: RegistroRefeicaoCreateOrConnectWithoutUsuarioInput | RegistroRefeicaoCreateOrConnectWithoutUsuarioInput[]
    createMany?: RegistroRefeicaoCreateManyUsuarioInputEnvelope
    connect?: RegistroRefeicaoWhereUniqueInput | RegistroRefeicaoWhereUniqueInput[]
  }

  export type RegistroSonoUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<RegistroSonoCreateWithoutUsuarioInput, RegistroSonoUncheckedCreateWithoutUsuarioInput> | RegistroSonoCreateWithoutUsuarioInput[] | RegistroSonoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: RegistroSonoCreateOrConnectWithoutUsuarioInput | RegistroSonoCreateOrConnectWithoutUsuarioInput[]
    createMany?: RegistroSonoCreateManyUsuarioInputEnvelope
    connect?: RegistroSonoWhereUniqueInput | RegistroSonoWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type LembreteSonoUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<LembreteSonoCreateWithoutUsuarioInput, LembreteSonoUncheckedCreateWithoutUsuarioInput> | LembreteSonoCreateWithoutUsuarioInput[] | LembreteSonoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: LembreteSonoCreateOrConnectWithoutUsuarioInput | LembreteSonoCreateOrConnectWithoutUsuarioInput[]
    upsert?: LembreteSonoUpsertWithWhereUniqueWithoutUsuarioInput | LembreteSonoUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: LembreteSonoCreateManyUsuarioInputEnvelope
    set?: LembreteSonoWhereUniqueInput | LembreteSonoWhereUniqueInput[]
    disconnect?: LembreteSonoWhereUniqueInput | LembreteSonoWhereUniqueInput[]
    delete?: LembreteSonoWhereUniqueInput | LembreteSonoWhereUniqueInput[]
    connect?: LembreteSonoWhereUniqueInput | LembreteSonoWhereUniqueInput[]
    update?: LembreteSonoUpdateWithWhereUniqueWithoutUsuarioInput | LembreteSonoUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: LembreteSonoUpdateManyWithWhereWithoutUsuarioInput | LembreteSonoUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: LembreteSonoScalarWhereInput | LembreteSonoScalarWhereInput[]
  }

  export type ReceitaUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<ReceitaCreateWithoutUsuarioInput, ReceitaUncheckedCreateWithoutUsuarioInput> | ReceitaCreateWithoutUsuarioInput[] | ReceitaUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: ReceitaCreateOrConnectWithoutUsuarioInput | ReceitaCreateOrConnectWithoutUsuarioInput[]
    upsert?: ReceitaUpsertWithWhereUniqueWithoutUsuarioInput | ReceitaUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: ReceitaCreateManyUsuarioInputEnvelope
    set?: ReceitaWhereUniqueInput | ReceitaWhereUniqueInput[]
    disconnect?: ReceitaWhereUniqueInput | ReceitaWhereUniqueInput[]
    delete?: ReceitaWhereUniqueInput | ReceitaWhereUniqueInput[]
    connect?: ReceitaWhereUniqueInput | ReceitaWhereUniqueInput[]
    update?: ReceitaUpdateWithWhereUniqueWithoutUsuarioInput | ReceitaUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: ReceitaUpdateManyWithWhereWithoutUsuarioInput | ReceitaUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: ReceitaScalarWhereInput | ReceitaScalarWhereInput[]
  }

  export type ReceitaFavoritaUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<ReceitaFavoritaCreateWithoutUsuarioInput, ReceitaFavoritaUncheckedCreateWithoutUsuarioInput> | ReceitaFavoritaCreateWithoutUsuarioInput[] | ReceitaFavoritaUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: ReceitaFavoritaCreateOrConnectWithoutUsuarioInput | ReceitaFavoritaCreateOrConnectWithoutUsuarioInput[]
    upsert?: ReceitaFavoritaUpsertWithWhereUniqueWithoutUsuarioInput | ReceitaFavoritaUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: ReceitaFavoritaCreateManyUsuarioInputEnvelope
    set?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
    disconnect?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
    delete?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
    connect?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
    update?: ReceitaFavoritaUpdateWithWhereUniqueWithoutUsuarioInput | ReceitaFavoritaUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: ReceitaFavoritaUpdateManyWithWhereWithoutUsuarioInput | ReceitaFavoritaUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: ReceitaFavoritaScalarWhereInput | ReceitaFavoritaScalarWhereInput[]
  }

  export type RefeicaoUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<RefeicaoCreateWithoutUsuarioInput, RefeicaoUncheckedCreateWithoutUsuarioInput> | RefeicaoCreateWithoutUsuarioInput[] | RefeicaoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: RefeicaoCreateOrConnectWithoutUsuarioInput | RefeicaoCreateOrConnectWithoutUsuarioInput[]
    upsert?: RefeicaoUpsertWithWhereUniqueWithoutUsuarioInput | RefeicaoUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: RefeicaoCreateManyUsuarioInputEnvelope
    set?: RefeicaoWhereUniqueInput | RefeicaoWhereUniqueInput[]
    disconnect?: RefeicaoWhereUniqueInput | RefeicaoWhereUniqueInput[]
    delete?: RefeicaoWhereUniqueInput | RefeicaoWhereUniqueInput[]
    connect?: RefeicaoWhereUniqueInput | RefeicaoWhereUniqueInput[]
    update?: RefeicaoUpdateWithWhereUniqueWithoutUsuarioInput | RefeicaoUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: RefeicaoUpdateManyWithWhereWithoutUsuarioInput | RefeicaoUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: RefeicaoScalarWhereInput | RefeicaoScalarWhereInput[]
  }

  export type RegistroRefeicaoUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<RegistroRefeicaoCreateWithoutUsuarioInput, RegistroRefeicaoUncheckedCreateWithoutUsuarioInput> | RegistroRefeicaoCreateWithoutUsuarioInput[] | RegistroRefeicaoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: RegistroRefeicaoCreateOrConnectWithoutUsuarioInput | RegistroRefeicaoCreateOrConnectWithoutUsuarioInput[]
    upsert?: RegistroRefeicaoUpsertWithWhereUniqueWithoutUsuarioInput | RegistroRefeicaoUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: RegistroRefeicaoCreateManyUsuarioInputEnvelope
    set?: RegistroRefeicaoWhereUniqueInput | RegistroRefeicaoWhereUniqueInput[]
    disconnect?: RegistroRefeicaoWhereUniqueInput | RegistroRefeicaoWhereUniqueInput[]
    delete?: RegistroRefeicaoWhereUniqueInput | RegistroRefeicaoWhereUniqueInput[]
    connect?: RegistroRefeicaoWhereUniqueInput | RegistroRefeicaoWhereUniqueInput[]
    update?: RegistroRefeicaoUpdateWithWhereUniqueWithoutUsuarioInput | RegistroRefeicaoUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: RegistroRefeicaoUpdateManyWithWhereWithoutUsuarioInput | RegistroRefeicaoUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: RegistroRefeicaoScalarWhereInput | RegistroRefeicaoScalarWhereInput[]
  }

  export type RegistroSonoUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<RegistroSonoCreateWithoutUsuarioInput, RegistroSonoUncheckedCreateWithoutUsuarioInput> | RegistroSonoCreateWithoutUsuarioInput[] | RegistroSonoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: RegistroSonoCreateOrConnectWithoutUsuarioInput | RegistroSonoCreateOrConnectWithoutUsuarioInput[]
    upsert?: RegistroSonoUpsertWithWhereUniqueWithoutUsuarioInput | RegistroSonoUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: RegistroSonoCreateManyUsuarioInputEnvelope
    set?: RegistroSonoWhereUniqueInput | RegistroSonoWhereUniqueInput[]
    disconnect?: RegistroSonoWhereUniqueInput | RegistroSonoWhereUniqueInput[]
    delete?: RegistroSonoWhereUniqueInput | RegistroSonoWhereUniqueInput[]
    connect?: RegistroSonoWhereUniqueInput | RegistroSonoWhereUniqueInput[]
    update?: RegistroSonoUpdateWithWhereUniqueWithoutUsuarioInput | RegistroSonoUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: RegistroSonoUpdateManyWithWhereWithoutUsuarioInput | RegistroSonoUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: RegistroSonoScalarWhereInput | RegistroSonoScalarWhereInput[]
  }

  export type LembreteSonoUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<LembreteSonoCreateWithoutUsuarioInput, LembreteSonoUncheckedCreateWithoutUsuarioInput> | LembreteSonoCreateWithoutUsuarioInput[] | LembreteSonoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: LembreteSonoCreateOrConnectWithoutUsuarioInput | LembreteSonoCreateOrConnectWithoutUsuarioInput[]
    upsert?: LembreteSonoUpsertWithWhereUniqueWithoutUsuarioInput | LembreteSonoUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: LembreteSonoCreateManyUsuarioInputEnvelope
    set?: LembreteSonoWhereUniqueInput | LembreteSonoWhereUniqueInput[]
    disconnect?: LembreteSonoWhereUniqueInput | LembreteSonoWhereUniqueInput[]
    delete?: LembreteSonoWhereUniqueInput | LembreteSonoWhereUniqueInput[]
    connect?: LembreteSonoWhereUniqueInput | LembreteSonoWhereUniqueInput[]
    update?: LembreteSonoUpdateWithWhereUniqueWithoutUsuarioInput | LembreteSonoUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: LembreteSonoUpdateManyWithWhereWithoutUsuarioInput | LembreteSonoUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: LembreteSonoScalarWhereInput | LembreteSonoScalarWhereInput[]
  }

  export type ReceitaUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<ReceitaCreateWithoutUsuarioInput, ReceitaUncheckedCreateWithoutUsuarioInput> | ReceitaCreateWithoutUsuarioInput[] | ReceitaUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: ReceitaCreateOrConnectWithoutUsuarioInput | ReceitaCreateOrConnectWithoutUsuarioInput[]
    upsert?: ReceitaUpsertWithWhereUniqueWithoutUsuarioInput | ReceitaUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: ReceitaCreateManyUsuarioInputEnvelope
    set?: ReceitaWhereUniqueInput | ReceitaWhereUniqueInput[]
    disconnect?: ReceitaWhereUniqueInput | ReceitaWhereUniqueInput[]
    delete?: ReceitaWhereUniqueInput | ReceitaWhereUniqueInput[]
    connect?: ReceitaWhereUniqueInput | ReceitaWhereUniqueInput[]
    update?: ReceitaUpdateWithWhereUniqueWithoutUsuarioInput | ReceitaUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: ReceitaUpdateManyWithWhereWithoutUsuarioInput | ReceitaUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: ReceitaScalarWhereInput | ReceitaScalarWhereInput[]
  }

  export type ReceitaFavoritaUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<ReceitaFavoritaCreateWithoutUsuarioInput, ReceitaFavoritaUncheckedCreateWithoutUsuarioInput> | ReceitaFavoritaCreateWithoutUsuarioInput[] | ReceitaFavoritaUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: ReceitaFavoritaCreateOrConnectWithoutUsuarioInput | ReceitaFavoritaCreateOrConnectWithoutUsuarioInput[]
    upsert?: ReceitaFavoritaUpsertWithWhereUniqueWithoutUsuarioInput | ReceitaFavoritaUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: ReceitaFavoritaCreateManyUsuarioInputEnvelope
    set?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
    disconnect?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
    delete?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
    connect?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
    update?: ReceitaFavoritaUpdateWithWhereUniqueWithoutUsuarioInput | ReceitaFavoritaUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: ReceitaFavoritaUpdateManyWithWhereWithoutUsuarioInput | ReceitaFavoritaUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: ReceitaFavoritaScalarWhereInput | ReceitaFavoritaScalarWhereInput[]
  }

  export type RefeicaoUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<RefeicaoCreateWithoutUsuarioInput, RefeicaoUncheckedCreateWithoutUsuarioInput> | RefeicaoCreateWithoutUsuarioInput[] | RefeicaoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: RefeicaoCreateOrConnectWithoutUsuarioInput | RefeicaoCreateOrConnectWithoutUsuarioInput[]
    upsert?: RefeicaoUpsertWithWhereUniqueWithoutUsuarioInput | RefeicaoUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: RefeicaoCreateManyUsuarioInputEnvelope
    set?: RefeicaoWhereUniqueInput | RefeicaoWhereUniqueInput[]
    disconnect?: RefeicaoWhereUniqueInput | RefeicaoWhereUniqueInput[]
    delete?: RefeicaoWhereUniqueInput | RefeicaoWhereUniqueInput[]
    connect?: RefeicaoWhereUniqueInput | RefeicaoWhereUniqueInput[]
    update?: RefeicaoUpdateWithWhereUniqueWithoutUsuarioInput | RefeicaoUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: RefeicaoUpdateManyWithWhereWithoutUsuarioInput | RefeicaoUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: RefeicaoScalarWhereInput | RefeicaoScalarWhereInput[]
  }

  export type RegistroRefeicaoUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<RegistroRefeicaoCreateWithoutUsuarioInput, RegistroRefeicaoUncheckedCreateWithoutUsuarioInput> | RegistroRefeicaoCreateWithoutUsuarioInput[] | RegistroRefeicaoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: RegistroRefeicaoCreateOrConnectWithoutUsuarioInput | RegistroRefeicaoCreateOrConnectWithoutUsuarioInput[]
    upsert?: RegistroRefeicaoUpsertWithWhereUniqueWithoutUsuarioInput | RegistroRefeicaoUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: RegistroRefeicaoCreateManyUsuarioInputEnvelope
    set?: RegistroRefeicaoWhereUniqueInput | RegistroRefeicaoWhereUniqueInput[]
    disconnect?: RegistroRefeicaoWhereUniqueInput | RegistroRefeicaoWhereUniqueInput[]
    delete?: RegistroRefeicaoWhereUniqueInput | RegistroRefeicaoWhereUniqueInput[]
    connect?: RegistroRefeicaoWhereUniqueInput | RegistroRefeicaoWhereUniqueInput[]
    update?: RegistroRefeicaoUpdateWithWhereUniqueWithoutUsuarioInput | RegistroRefeicaoUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: RegistroRefeicaoUpdateManyWithWhereWithoutUsuarioInput | RegistroRefeicaoUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: RegistroRefeicaoScalarWhereInput | RegistroRefeicaoScalarWhereInput[]
  }

  export type RegistroSonoUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<RegistroSonoCreateWithoutUsuarioInput, RegistroSonoUncheckedCreateWithoutUsuarioInput> | RegistroSonoCreateWithoutUsuarioInput[] | RegistroSonoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: RegistroSonoCreateOrConnectWithoutUsuarioInput | RegistroSonoCreateOrConnectWithoutUsuarioInput[]
    upsert?: RegistroSonoUpsertWithWhereUniqueWithoutUsuarioInput | RegistroSonoUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: RegistroSonoCreateManyUsuarioInputEnvelope
    set?: RegistroSonoWhereUniqueInput | RegistroSonoWhereUniqueInput[]
    disconnect?: RegistroSonoWhereUniqueInput | RegistroSonoWhereUniqueInput[]
    delete?: RegistroSonoWhereUniqueInput | RegistroSonoWhereUniqueInput[]
    connect?: RegistroSonoWhereUniqueInput | RegistroSonoWhereUniqueInput[]
    update?: RegistroSonoUpdateWithWhereUniqueWithoutUsuarioInput | RegistroSonoUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: RegistroSonoUpdateManyWithWhereWithoutUsuarioInput | RegistroSonoUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: RegistroSonoScalarWhereInput | RegistroSonoScalarWhereInput[]
  }

  export type UsuarioCreateNestedOneWithoutRefeicoesInput = {
    create?: XOR<UsuarioCreateWithoutRefeicoesInput, UsuarioUncheckedCreateWithoutRefeicoesInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutRefeicoesInput
    connect?: UsuarioWhereUniqueInput
  }

  export type UsuarioUpdateOneRequiredWithoutRefeicoesNestedInput = {
    create?: XOR<UsuarioCreateWithoutRefeicoesInput, UsuarioUncheckedCreateWithoutRefeicoesInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutRefeicoesInput
    upsert?: UsuarioUpsertWithoutRefeicoesInput
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutRefeicoesInput, UsuarioUpdateWithoutRefeicoesInput>, UsuarioUncheckedUpdateWithoutRefeicoesInput>
  }

  export type UsuarioCreateNestedOneWithoutRegistrosRefeicaoInput = {
    create?: XOR<UsuarioCreateWithoutRegistrosRefeicaoInput, UsuarioUncheckedCreateWithoutRegistrosRefeicaoInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutRegistrosRefeicaoInput
    connect?: UsuarioWhereUniqueInput
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type UsuarioUpdateOneRequiredWithoutRegistrosRefeicaoNestedInput = {
    create?: XOR<UsuarioCreateWithoutRegistrosRefeicaoInput, UsuarioUncheckedCreateWithoutRegistrosRefeicaoInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutRegistrosRefeicaoInput
    upsert?: UsuarioUpsertWithoutRegistrosRefeicaoInput
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutRegistrosRefeicaoInput, UsuarioUpdateWithoutRegistrosRefeicaoInput>, UsuarioUncheckedUpdateWithoutRegistrosRefeicaoInput>
  }

  export type UsuarioCreateNestedOneWithoutRegistrosSonoInput = {
    create?: XOR<UsuarioCreateWithoutRegistrosSonoInput, UsuarioUncheckedCreateWithoutRegistrosSonoInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutRegistrosSonoInput
    connect?: UsuarioWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UsuarioUpdateOneRequiredWithoutRegistrosSonoNestedInput = {
    create?: XOR<UsuarioCreateWithoutRegistrosSonoInput, UsuarioUncheckedCreateWithoutRegistrosSonoInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutRegistrosSonoInput
    upsert?: UsuarioUpsertWithoutRegistrosSonoInput
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutRegistrosSonoInput, UsuarioUpdateWithoutRegistrosSonoInput>, UsuarioUncheckedUpdateWithoutRegistrosSonoInput>
  }

  export type LembreteSonoCreatediasSemanaInput = {
    set: number[]
  }

  export type UsuarioCreateNestedOneWithoutLembretesSonoInput = {
    create?: XOR<UsuarioCreateWithoutLembretesSonoInput, UsuarioUncheckedCreateWithoutLembretesSonoInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutLembretesSonoInput
    connect?: UsuarioWhereUniqueInput
  }

  export type LembreteSonoUpdatediasSemanaInput = {
    set?: number[]
    push?: number | number[]
  }

  export type UsuarioUpdateOneRequiredWithoutLembretesSonoNestedInput = {
    create?: XOR<UsuarioCreateWithoutLembretesSonoInput, UsuarioUncheckedCreateWithoutLembretesSonoInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutLembretesSonoInput
    upsert?: UsuarioUpsertWithoutLembretesSonoInput
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutLembretesSonoInput, UsuarioUpdateWithoutLembretesSonoInput>, UsuarioUncheckedUpdateWithoutLembretesSonoInput>
  }

  export type ReceitaCreatecategoriasInput = {
    set: string[]
  }

  export type ReceitaCreatetagsInput = {
    set: string[]
  }

  export type IngredienteCreateNestedManyWithoutReceitaInput = {
    create?: XOR<IngredienteCreateWithoutReceitaInput, IngredienteUncheckedCreateWithoutReceitaInput> | IngredienteCreateWithoutReceitaInput[] | IngredienteUncheckedCreateWithoutReceitaInput[]
    connectOrCreate?: IngredienteCreateOrConnectWithoutReceitaInput | IngredienteCreateOrConnectWithoutReceitaInput[]
    createMany?: IngredienteCreateManyReceitaInputEnvelope
    connect?: IngredienteWhereUniqueInput | IngredienteWhereUniqueInput[]
  }

  export type PassoReceitaCreateNestedManyWithoutReceitaInput = {
    create?: XOR<PassoReceitaCreateWithoutReceitaInput, PassoReceitaUncheckedCreateWithoutReceitaInput> | PassoReceitaCreateWithoutReceitaInput[] | PassoReceitaUncheckedCreateWithoutReceitaInput[]
    connectOrCreate?: PassoReceitaCreateOrConnectWithoutReceitaInput | PassoReceitaCreateOrConnectWithoutReceitaInput[]
    createMany?: PassoReceitaCreateManyReceitaInputEnvelope
    connect?: PassoReceitaWhereUniqueInput | PassoReceitaWhereUniqueInput[]
  }

  export type UsuarioCreateNestedOneWithoutReceitasInput = {
    create?: XOR<UsuarioCreateWithoutReceitasInput, UsuarioUncheckedCreateWithoutReceitasInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutReceitasInput
    connect?: UsuarioWhereUniqueInput
  }

  export type ReceitaFavoritaCreateNestedManyWithoutReceitaInput = {
    create?: XOR<ReceitaFavoritaCreateWithoutReceitaInput, ReceitaFavoritaUncheckedCreateWithoutReceitaInput> | ReceitaFavoritaCreateWithoutReceitaInput[] | ReceitaFavoritaUncheckedCreateWithoutReceitaInput[]
    connectOrCreate?: ReceitaFavoritaCreateOrConnectWithoutReceitaInput | ReceitaFavoritaCreateOrConnectWithoutReceitaInput[]
    createMany?: ReceitaFavoritaCreateManyReceitaInputEnvelope
    connect?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
  }

  export type IngredienteUncheckedCreateNestedManyWithoutReceitaInput = {
    create?: XOR<IngredienteCreateWithoutReceitaInput, IngredienteUncheckedCreateWithoutReceitaInput> | IngredienteCreateWithoutReceitaInput[] | IngredienteUncheckedCreateWithoutReceitaInput[]
    connectOrCreate?: IngredienteCreateOrConnectWithoutReceitaInput | IngredienteCreateOrConnectWithoutReceitaInput[]
    createMany?: IngredienteCreateManyReceitaInputEnvelope
    connect?: IngredienteWhereUniqueInput | IngredienteWhereUniqueInput[]
  }

  export type PassoReceitaUncheckedCreateNestedManyWithoutReceitaInput = {
    create?: XOR<PassoReceitaCreateWithoutReceitaInput, PassoReceitaUncheckedCreateWithoutReceitaInput> | PassoReceitaCreateWithoutReceitaInput[] | PassoReceitaUncheckedCreateWithoutReceitaInput[]
    connectOrCreate?: PassoReceitaCreateOrConnectWithoutReceitaInput | PassoReceitaCreateOrConnectWithoutReceitaInput[]
    createMany?: PassoReceitaCreateManyReceitaInputEnvelope
    connect?: PassoReceitaWhereUniqueInput | PassoReceitaWhereUniqueInput[]
  }

  export type ReceitaFavoritaUncheckedCreateNestedManyWithoutReceitaInput = {
    create?: XOR<ReceitaFavoritaCreateWithoutReceitaInput, ReceitaFavoritaUncheckedCreateWithoutReceitaInput> | ReceitaFavoritaCreateWithoutReceitaInput[] | ReceitaFavoritaUncheckedCreateWithoutReceitaInput[]
    connectOrCreate?: ReceitaFavoritaCreateOrConnectWithoutReceitaInput | ReceitaFavoritaCreateOrConnectWithoutReceitaInput[]
    createMany?: ReceitaFavoritaCreateManyReceitaInputEnvelope
    connect?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
  }

  export type ReceitaUpdatecategoriasInput = {
    set?: string[]
    push?: string | string[]
  }

  export type ReceitaUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type IngredienteUpdateManyWithoutReceitaNestedInput = {
    create?: XOR<IngredienteCreateWithoutReceitaInput, IngredienteUncheckedCreateWithoutReceitaInput> | IngredienteCreateWithoutReceitaInput[] | IngredienteUncheckedCreateWithoutReceitaInput[]
    connectOrCreate?: IngredienteCreateOrConnectWithoutReceitaInput | IngredienteCreateOrConnectWithoutReceitaInput[]
    upsert?: IngredienteUpsertWithWhereUniqueWithoutReceitaInput | IngredienteUpsertWithWhereUniqueWithoutReceitaInput[]
    createMany?: IngredienteCreateManyReceitaInputEnvelope
    set?: IngredienteWhereUniqueInput | IngredienteWhereUniqueInput[]
    disconnect?: IngredienteWhereUniqueInput | IngredienteWhereUniqueInput[]
    delete?: IngredienteWhereUniqueInput | IngredienteWhereUniqueInput[]
    connect?: IngredienteWhereUniqueInput | IngredienteWhereUniqueInput[]
    update?: IngredienteUpdateWithWhereUniqueWithoutReceitaInput | IngredienteUpdateWithWhereUniqueWithoutReceitaInput[]
    updateMany?: IngredienteUpdateManyWithWhereWithoutReceitaInput | IngredienteUpdateManyWithWhereWithoutReceitaInput[]
    deleteMany?: IngredienteScalarWhereInput | IngredienteScalarWhereInput[]
  }

  export type PassoReceitaUpdateManyWithoutReceitaNestedInput = {
    create?: XOR<PassoReceitaCreateWithoutReceitaInput, PassoReceitaUncheckedCreateWithoutReceitaInput> | PassoReceitaCreateWithoutReceitaInput[] | PassoReceitaUncheckedCreateWithoutReceitaInput[]
    connectOrCreate?: PassoReceitaCreateOrConnectWithoutReceitaInput | PassoReceitaCreateOrConnectWithoutReceitaInput[]
    upsert?: PassoReceitaUpsertWithWhereUniqueWithoutReceitaInput | PassoReceitaUpsertWithWhereUniqueWithoutReceitaInput[]
    createMany?: PassoReceitaCreateManyReceitaInputEnvelope
    set?: PassoReceitaWhereUniqueInput | PassoReceitaWhereUniqueInput[]
    disconnect?: PassoReceitaWhereUniqueInput | PassoReceitaWhereUniqueInput[]
    delete?: PassoReceitaWhereUniqueInput | PassoReceitaWhereUniqueInput[]
    connect?: PassoReceitaWhereUniqueInput | PassoReceitaWhereUniqueInput[]
    update?: PassoReceitaUpdateWithWhereUniqueWithoutReceitaInput | PassoReceitaUpdateWithWhereUniqueWithoutReceitaInput[]
    updateMany?: PassoReceitaUpdateManyWithWhereWithoutReceitaInput | PassoReceitaUpdateManyWithWhereWithoutReceitaInput[]
    deleteMany?: PassoReceitaScalarWhereInput | PassoReceitaScalarWhereInput[]
  }

  export type UsuarioUpdateOneRequiredWithoutReceitasNestedInput = {
    create?: XOR<UsuarioCreateWithoutReceitasInput, UsuarioUncheckedCreateWithoutReceitasInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutReceitasInput
    upsert?: UsuarioUpsertWithoutReceitasInput
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutReceitasInput, UsuarioUpdateWithoutReceitasInput>, UsuarioUncheckedUpdateWithoutReceitasInput>
  }

  export type ReceitaFavoritaUpdateManyWithoutReceitaNestedInput = {
    create?: XOR<ReceitaFavoritaCreateWithoutReceitaInput, ReceitaFavoritaUncheckedCreateWithoutReceitaInput> | ReceitaFavoritaCreateWithoutReceitaInput[] | ReceitaFavoritaUncheckedCreateWithoutReceitaInput[]
    connectOrCreate?: ReceitaFavoritaCreateOrConnectWithoutReceitaInput | ReceitaFavoritaCreateOrConnectWithoutReceitaInput[]
    upsert?: ReceitaFavoritaUpsertWithWhereUniqueWithoutReceitaInput | ReceitaFavoritaUpsertWithWhereUniqueWithoutReceitaInput[]
    createMany?: ReceitaFavoritaCreateManyReceitaInputEnvelope
    set?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
    disconnect?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
    delete?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
    connect?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
    update?: ReceitaFavoritaUpdateWithWhereUniqueWithoutReceitaInput | ReceitaFavoritaUpdateWithWhereUniqueWithoutReceitaInput[]
    updateMany?: ReceitaFavoritaUpdateManyWithWhereWithoutReceitaInput | ReceitaFavoritaUpdateManyWithWhereWithoutReceitaInput[]
    deleteMany?: ReceitaFavoritaScalarWhereInput | ReceitaFavoritaScalarWhereInput[]
  }

  export type IngredienteUncheckedUpdateManyWithoutReceitaNestedInput = {
    create?: XOR<IngredienteCreateWithoutReceitaInput, IngredienteUncheckedCreateWithoutReceitaInput> | IngredienteCreateWithoutReceitaInput[] | IngredienteUncheckedCreateWithoutReceitaInput[]
    connectOrCreate?: IngredienteCreateOrConnectWithoutReceitaInput | IngredienteCreateOrConnectWithoutReceitaInput[]
    upsert?: IngredienteUpsertWithWhereUniqueWithoutReceitaInput | IngredienteUpsertWithWhereUniqueWithoutReceitaInput[]
    createMany?: IngredienteCreateManyReceitaInputEnvelope
    set?: IngredienteWhereUniqueInput | IngredienteWhereUniqueInput[]
    disconnect?: IngredienteWhereUniqueInput | IngredienteWhereUniqueInput[]
    delete?: IngredienteWhereUniqueInput | IngredienteWhereUniqueInput[]
    connect?: IngredienteWhereUniqueInput | IngredienteWhereUniqueInput[]
    update?: IngredienteUpdateWithWhereUniqueWithoutReceitaInput | IngredienteUpdateWithWhereUniqueWithoutReceitaInput[]
    updateMany?: IngredienteUpdateManyWithWhereWithoutReceitaInput | IngredienteUpdateManyWithWhereWithoutReceitaInput[]
    deleteMany?: IngredienteScalarWhereInput | IngredienteScalarWhereInput[]
  }

  export type PassoReceitaUncheckedUpdateManyWithoutReceitaNestedInput = {
    create?: XOR<PassoReceitaCreateWithoutReceitaInput, PassoReceitaUncheckedCreateWithoutReceitaInput> | PassoReceitaCreateWithoutReceitaInput[] | PassoReceitaUncheckedCreateWithoutReceitaInput[]
    connectOrCreate?: PassoReceitaCreateOrConnectWithoutReceitaInput | PassoReceitaCreateOrConnectWithoutReceitaInput[]
    upsert?: PassoReceitaUpsertWithWhereUniqueWithoutReceitaInput | PassoReceitaUpsertWithWhereUniqueWithoutReceitaInput[]
    createMany?: PassoReceitaCreateManyReceitaInputEnvelope
    set?: PassoReceitaWhereUniqueInput | PassoReceitaWhereUniqueInput[]
    disconnect?: PassoReceitaWhereUniqueInput | PassoReceitaWhereUniqueInput[]
    delete?: PassoReceitaWhereUniqueInput | PassoReceitaWhereUniqueInput[]
    connect?: PassoReceitaWhereUniqueInput | PassoReceitaWhereUniqueInput[]
    update?: PassoReceitaUpdateWithWhereUniqueWithoutReceitaInput | PassoReceitaUpdateWithWhereUniqueWithoutReceitaInput[]
    updateMany?: PassoReceitaUpdateManyWithWhereWithoutReceitaInput | PassoReceitaUpdateManyWithWhereWithoutReceitaInput[]
    deleteMany?: PassoReceitaScalarWhereInput | PassoReceitaScalarWhereInput[]
  }

  export type ReceitaFavoritaUncheckedUpdateManyWithoutReceitaNestedInput = {
    create?: XOR<ReceitaFavoritaCreateWithoutReceitaInput, ReceitaFavoritaUncheckedCreateWithoutReceitaInput> | ReceitaFavoritaCreateWithoutReceitaInput[] | ReceitaFavoritaUncheckedCreateWithoutReceitaInput[]
    connectOrCreate?: ReceitaFavoritaCreateOrConnectWithoutReceitaInput | ReceitaFavoritaCreateOrConnectWithoutReceitaInput[]
    upsert?: ReceitaFavoritaUpsertWithWhereUniqueWithoutReceitaInput | ReceitaFavoritaUpsertWithWhereUniqueWithoutReceitaInput[]
    createMany?: ReceitaFavoritaCreateManyReceitaInputEnvelope
    set?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
    disconnect?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
    delete?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
    connect?: ReceitaFavoritaWhereUniqueInput | ReceitaFavoritaWhereUniqueInput[]
    update?: ReceitaFavoritaUpdateWithWhereUniqueWithoutReceitaInput | ReceitaFavoritaUpdateWithWhereUniqueWithoutReceitaInput[]
    updateMany?: ReceitaFavoritaUpdateManyWithWhereWithoutReceitaInput | ReceitaFavoritaUpdateManyWithWhereWithoutReceitaInput[]
    deleteMany?: ReceitaFavoritaScalarWhereInput | ReceitaFavoritaScalarWhereInput[]
  }

  export type ReceitaCreateNestedOneWithoutIngredientesInput = {
    create?: XOR<ReceitaCreateWithoutIngredientesInput, ReceitaUncheckedCreateWithoutIngredientesInput>
    connectOrCreate?: ReceitaCreateOrConnectWithoutIngredientesInput
    connect?: ReceitaWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ReceitaUpdateOneRequiredWithoutIngredientesNestedInput = {
    create?: XOR<ReceitaCreateWithoutIngredientesInput, ReceitaUncheckedCreateWithoutIngredientesInput>
    connectOrCreate?: ReceitaCreateOrConnectWithoutIngredientesInput
    upsert?: ReceitaUpsertWithoutIngredientesInput
    connect?: ReceitaWhereUniqueInput
    update?: XOR<XOR<ReceitaUpdateToOneWithWhereWithoutIngredientesInput, ReceitaUpdateWithoutIngredientesInput>, ReceitaUncheckedUpdateWithoutIngredientesInput>
  }

  export type ReceitaCreateNestedOneWithoutPassosInput = {
    create?: XOR<ReceitaCreateWithoutPassosInput, ReceitaUncheckedCreateWithoutPassosInput>
    connectOrCreate?: ReceitaCreateOrConnectWithoutPassosInput
    connect?: ReceitaWhereUniqueInput
  }

  export type ReceitaUpdateOneRequiredWithoutPassosNestedInput = {
    create?: XOR<ReceitaCreateWithoutPassosInput, ReceitaUncheckedCreateWithoutPassosInput>
    connectOrCreate?: ReceitaCreateOrConnectWithoutPassosInput
    upsert?: ReceitaUpsertWithoutPassosInput
    connect?: ReceitaWhereUniqueInput
    update?: XOR<XOR<ReceitaUpdateToOneWithWhereWithoutPassosInput, ReceitaUpdateWithoutPassosInput>, ReceitaUncheckedUpdateWithoutPassosInput>
  }

  export type ReceitaCreateNestedOneWithoutFavoritosInput = {
    create?: XOR<ReceitaCreateWithoutFavoritosInput, ReceitaUncheckedCreateWithoutFavoritosInput>
    connectOrCreate?: ReceitaCreateOrConnectWithoutFavoritosInput
    connect?: ReceitaWhereUniqueInput
  }

  export type UsuarioCreateNestedOneWithoutReceitasFavoritasInput = {
    create?: XOR<UsuarioCreateWithoutReceitasFavoritasInput, UsuarioUncheckedCreateWithoutReceitasFavoritasInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutReceitasFavoritasInput
    connect?: UsuarioWhereUniqueInput
  }

  export type ReceitaUpdateOneRequiredWithoutFavoritosNestedInput = {
    create?: XOR<ReceitaCreateWithoutFavoritosInput, ReceitaUncheckedCreateWithoutFavoritosInput>
    connectOrCreate?: ReceitaCreateOrConnectWithoutFavoritosInput
    upsert?: ReceitaUpsertWithoutFavoritosInput
    connect?: ReceitaWhereUniqueInput
    update?: XOR<XOR<ReceitaUpdateToOneWithWhereWithoutFavoritosInput, ReceitaUpdateWithoutFavoritosInput>, ReceitaUncheckedUpdateWithoutFavoritosInput>
  }

  export type UsuarioUpdateOneRequiredWithoutReceitasFavoritasNestedInput = {
    create?: XOR<UsuarioCreateWithoutReceitasFavoritasInput, UsuarioUncheckedCreateWithoutReceitasFavoritasInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutReceitasFavoritasInput
    upsert?: UsuarioUpsertWithoutReceitasFavoritasInput
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutReceitasFavoritasInput, UsuarioUpdateWithoutReceitasFavoritasInput>, UsuarioUncheckedUpdateWithoutReceitasFavoritasInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type LembreteSonoCreateWithoutUsuarioInput = {
    id?: string
    tipo: string
    horario: string
    diasSemana?: LembreteSonoCreatediasSemanaInput | number[]
    ativo?: boolean
  }

  export type LembreteSonoUncheckedCreateWithoutUsuarioInput = {
    id?: string
    tipo: string
    horario: string
    diasSemana?: LembreteSonoCreatediasSemanaInput | number[]
    ativo?: boolean
  }

  export type LembreteSonoCreateOrConnectWithoutUsuarioInput = {
    where: LembreteSonoWhereUniqueInput
    create: XOR<LembreteSonoCreateWithoutUsuarioInput, LembreteSonoUncheckedCreateWithoutUsuarioInput>
  }

  export type LembreteSonoCreateManyUsuarioInputEnvelope = {
    data: LembreteSonoCreateManyUsuarioInput | LembreteSonoCreateManyUsuarioInput[]
    skipDuplicates?: boolean
  }

  export type ReceitaCreateWithoutUsuarioInput = {
    id?: string
    nome: string
    descricao: string
    categorias?: ReceitaCreatecategoriasInput | string[]
    tags?: ReceitaCreatetagsInput | string[]
    tempoPreparo: number
    porcoes: number
    calorias: string
    imagem?: string | null
    ingredientes?: IngredienteCreateNestedManyWithoutReceitaInput
    passos?: PassoReceitaCreateNestedManyWithoutReceitaInput
    favoritos?: ReceitaFavoritaCreateNestedManyWithoutReceitaInput
  }

  export type ReceitaUncheckedCreateWithoutUsuarioInput = {
    id?: string
    nome: string
    descricao: string
    categorias?: ReceitaCreatecategoriasInput | string[]
    tags?: ReceitaCreatetagsInput | string[]
    tempoPreparo: number
    porcoes: number
    calorias: string
    imagem?: string | null
    ingredientes?: IngredienteUncheckedCreateNestedManyWithoutReceitaInput
    passos?: PassoReceitaUncheckedCreateNestedManyWithoutReceitaInput
    favoritos?: ReceitaFavoritaUncheckedCreateNestedManyWithoutReceitaInput
  }

  export type ReceitaCreateOrConnectWithoutUsuarioInput = {
    where: ReceitaWhereUniqueInput
    create: XOR<ReceitaCreateWithoutUsuarioInput, ReceitaUncheckedCreateWithoutUsuarioInput>
  }

  export type ReceitaCreateManyUsuarioInputEnvelope = {
    data: ReceitaCreateManyUsuarioInput | ReceitaCreateManyUsuarioInput[]
    skipDuplicates?: boolean
  }

  export type ReceitaFavoritaCreateWithoutUsuarioInput = {
    id?: string
    receita: ReceitaCreateNestedOneWithoutFavoritosInput
  }

  export type ReceitaFavoritaUncheckedCreateWithoutUsuarioInput = {
    id?: string
    receitaId: string
  }

  export type ReceitaFavoritaCreateOrConnectWithoutUsuarioInput = {
    where: ReceitaFavoritaWhereUniqueInput
    create: XOR<ReceitaFavoritaCreateWithoutUsuarioInput, ReceitaFavoritaUncheckedCreateWithoutUsuarioInput>
  }

  export type ReceitaFavoritaCreateManyUsuarioInputEnvelope = {
    data: ReceitaFavoritaCreateManyUsuarioInput | ReceitaFavoritaCreateManyUsuarioInput[]
    skipDuplicates?: boolean
  }

  export type RefeicaoCreateWithoutUsuarioInput = {
    id?: string
    horario: string
    descricao: string
  }

  export type RefeicaoUncheckedCreateWithoutUsuarioInput = {
    id?: string
    horario: string
    descricao: string
  }

  export type RefeicaoCreateOrConnectWithoutUsuarioInput = {
    where: RefeicaoWhereUniqueInput
    create: XOR<RefeicaoCreateWithoutUsuarioInput, RefeicaoUncheckedCreateWithoutUsuarioInput>
  }

  export type RefeicaoCreateManyUsuarioInputEnvelope = {
    data: RefeicaoCreateManyUsuarioInput | RefeicaoCreateManyUsuarioInput[]
    skipDuplicates?: boolean
  }

  export type RegistroRefeicaoCreateWithoutUsuarioInput = {
    id?: string
    data: Date | string
    horario: string
    descricao: string
    tipoIcone?: string | null
    foto?: string | null
  }

  export type RegistroRefeicaoUncheckedCreateWithoutUsuarioInput = {
    id?: string
    data: Date | string
    horario: string
    descricao: string
    tipoIcone?: string | null
    foto?: string | null
  }

  export type RegistroRefeicaoCreateOrConnectWithoutUsuarioInput = {
    where: RegistroRefeicaoWhereUniqueInput
    create: XOR<RegistroRefeicaoCreateWithoutUsuarioInput, RegistroRefeicaoUncheckedCreateWithoutUsuarioInput>
  }

  export type RegistroRefeicaoCreateManyUsuarioInputEnvelope = {
    data: RegistroRefeicaoCreateManyUsuarioInput | RegistroRefeicaoCreateManyUsuarioInput[]
    skipDuplicates?: boolean
  }

  export type RegistroSonoCreateWithoutUsuarioInput = {
    id?: string
    inicio: Date | string
    fim?: Date | string | null
    qualidade?: number | null
    notas?: string | null
  }

  export type RegistroSonoUncheckedCreateWithoutUsuarioInput = {
    id?: string
    inicio: Date | string
    fim?: Date | string | null
    qualidade?: number | null
    notas?: string | null
  }

  export type RegistroSonoCreateOrConnectWithoutUsuarioInput = {
    where: RegistroSonoWhereUniqueInput
    create: XOR<RegistroSonoCreateWithoutUsuarioInput, RegistroSonoUncheckedCreateWithoutUsuarioInput>
  }

  export type RegistroSonoCreateManyUsuarioInputEnvelope = {
    data: RegistroSonoCreateManyUsuarioInput | RegistroSonoCreateManyUsuarioInput[]
    skipDuplicates?: boolean
  }

  export type LembreteSonoUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: LembreteSonoWhereUniqueInput
    update: XOR<LembreteSonoUpdateWithoutUsuarioInput, LembreteSonoUncheckedUpdateWithoutUsuarioInput>
    create: XOR<LembreteSonoCreateWithoutUsuarioInput, LembreteSonoUncheckedCreateWithoutUsuarioInput>
  }

  export type LembreteSonoUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: LembreteSonoWhereUniqueInput
    data: XOR<LembreteSonoUpdateWithoutUsuarioInput, LembreteSonoUncheckedUpdateWithoutUsuarioInput>
  }

  export type LembreteSonoUpdateManyWithWhereWithoutUsuarioInput = {
    where: LembreteSonoScalarWhereInput
    data: XOR<LembreteSonoUpdateManyMutationInput, LembreteSonoUncheckedUpdateManyWithoutUsuarioInput>
  }

  export type LembreteSonoScalarWhereInput = {
    AND?: LembreteSonoScalarWhereInput | LembreteSonoScalarWhereInput[]
    OR?: LembreteSonoScalarWhereInput[]
    NOT?: LembreteSonoScalarWhereInput | LembreteSonoScalarWhereInput[]
    id?: StringFilter<"LembreteSono"> | string
    tipo?: StringFilter<"LembreteSono"> | string
    horario?: StringFilter<"LembreteSono"> | string
    diasSemana?: IntNullableListFilter<"LembreteSono">
    ativo?: BoolFilter<"LembreteSono"> | boolean
    usuarioId?: StringFilter<"LembreteSono"> | string
  }

  export type ReceitaUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: ReceitaWhereUniqueInput
    update: XOR<ReceitaUpdateWithoutUsuarioInput, ReceitaUncheckedUpdateWithoutUsuarioInput>
    create: XOR<ReceitaCreateWithoutUsuarioInput, ReceitaUncheckedCreateWithoutUsuarioInput>
  }

  export type ReceitaUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: ReceitaWhereUniqueInput
    data: XOR<ReceitaUpdateWithoutUsuarioInput, ReceitaUncheckedUpdateWithoutUsuarioInput>
  }

  export type ReceitaUpdateManyWithWhereWithoutUsuarioInput = {
    where: ReceitaScalarWhereInput
    data: XOR<ReceitaUpdateManyMutationInput, ReceitaUncheckedUpdateManyWithoutUsuarioInput>
  }

  export type ReceitaScalarWhereInput = {
    AND?: ReceitaScalarWhereInput | ReceitaScalarWhereInput[]
    OR?: ReceitaScalarWhereInput[]
    NOT?: ReceitaScalarWhereInput | ReceitaScalarWhereInput[]
    id?: StringFilter<"Receita"> | string
    nome?: StringFilter<"Receita"> | string
    descricao?: StringFilter<"Receita"> | string
    categorias?: StringNullableListFilter<"Receita">
    tags?: StringNullableListFilter<"Receita">
    tempoPreparo?: IntFilter<"Receita"> | number
    porcoes?: IntFilter<"Receita"> | number
    calorias?: StringFilter<"Receita"> | string
    imagem?: StringNullableFilter<"Receita"> | string | null
    usuarioId?: StringFilter<"Receita"> | string
  }

  export type ReceitaFavoritaUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: ReceitaFavoritaWhereUniqueInput
    update: XOR<ReceitaFavoritaUpdateWithoutUsuarioInput, ReceitaFavoritaUncheckedUpdateWithoutUsuarioInput>
    create: XOR<ReceitaFavoritaCreateWithoutUsuarioInput, ReceitaFavoritaUncheckedCreateWithoutUsuarioInput>
  }

  export type ReceitaFavoritaUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: ReceitaFavoritaWhereUniqueInput
    data: XOR<ReceitaFavoritaUpdateWithoutUsuarioInput, ReceitaFavoritaUncheckedUpdateWithoutUsuarioInput>
  }

  export type ReceitaFavoritaUpdateManyWithWhereWithoutUsuarioInput = {
    where: ReceitaFavoritaScalarWhereInput
    data: XOR<ReceitaFavoritaUpdateManyMutationInput, ReceitaFavoritaUncheckedUpdateManyWithoutUsuarioInput>
  }

  export type ReceitaFavoritaScalarWhereInput = {
    AND?: ReceitaFavoritaScalarWhereInput | ReceitaFavoritaScalarWhereInput[]
    OR?: ReceitaFavoritaScalarWhereInput[]
    NOT?: ReceitaFavoritaScalarWhereInput | ReceitaFavoritaScalarWhereInput[]
    id?: StringFilter<"ReceitaFavorita"> | string
    usuarioId?: StringFilter<"ReceitaFavorita"> | string
    receitaId?: StringFilter<"ReceitaFavorita"> | string
  }

  export type RefeicaoUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: RefeicaoWhereUniqueInput
    update: XOR<RefeicaoUpdateWithoutUsuarioInput, RefeicaoUncheckedUpdateWithoutUsuarioInput>
    create: XOR<RefeicaoCreateWithoutUsuarioInput, RefeicaoUncheckedCreateWithoutUsuarioInput>
  }

  export type RefeicaoUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: RefeicaoWhereUniqueInput
    data: XOR<RefeicaoUpdateWithoutUsuarioInput, RefeicaoUncheckedUpdateWithoutUsuarioInput>
  }

  export type RefeicaoUpdateManyWithWhereWithoutUsuarioInput = {
    where: RefeicaoScalarWhereInput
    data: XOR<RefeicaoUpdateManyMutationInput, RefeicaoUncheckedUpdateManyWithoutUsuarioInput>
  }

  export type RefeicaoScalarWhereInput = {
    AND?: RefeicaoScalarWhereInput | RefeicaoScalarWhereInput[]
    OR?: RefeicaoScalarWhereInput[]
    NOT?: RefeicaoScalarWhereInput | RefeicaoScalarWhereInput[]
    id?: StringFilter<"Refeicao"> | string
    horario?: StringFilter<"Refeicao"> | string
    descricao?: StringFilter<"Refeicao"> | string
    usuarioId?: StringFilter<"Refeicao"> | string
  }

  export type RegistroRefeicaoUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: RegistroRefeicaoWhereUniqueInput
    update: XOR<RegistroRefeicaoUpdateWithoutUsuarioInput, RegistroRefeicaoUncheckedUpdateWithoutUsuarioInput>
    create: XOR<RegistroRefeicaoCreateWithoutUsuarioInput, RegistroRefeicaoUncheckedCreateWithoutUsuarioInput>
  }

  export type RegistroRefeicaoUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: RegistroRefeicaoWhereUniqueInput
    data: XOR<RegistroRefeicaoUpdateWithoutUsuarioInput, RegistroRefeicaoUncheckedUpdateWithoutUsuarioInput>
  }

  export type RegistroRefeicaoUpdateManyWithWhereWithoutUsuarioInput = {
    where: RegistroRefeicaoScalarWhereInput
    data: XOR<RegistroRefeicaoUpdateManyMutationInput, RegistroRefeicaoUncheckedUpdateManyWithoutUsuarioInput>
  }

  export type RegistroRefeicaoScalarWhereInput = {
    AND?: RegistroRefeicaoScalarWhereInput | RegistroRefeicaoScalarWhereInput[]
    OR?: RegistroRefeicaoScalarWhereInput[]
    NOT?: RegistroRefeicaoScalarWhereInput | RegistroRefeicaoScalarWhereInput[]
    id?: StringFilter<"RegistroRefeicao"> | string
    data?: DateTimeFilter<"RegistroRefeicao"> | Date | string
    horario?: StringFilter<"RegistroRefeicao"> | string
    descricao?: StringFilter<"RegistroRefeicao"> | string
    tipoIcone?: StringNullableFilter<"RegistroRefeicao"> | string | null
    foto?: StringNullableFilter<"RegistroRefeicao"> | string | null
    usuarioId?: StringFilter<"RegistroRefeicao"> | string
  }

  export type RegistroSonoUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: RegistroSonoWhereUniqueInput
    update: XOR<RegistroSonoUpdateWithoutUsuarioInput, RegistroSonoUncheckedUpdateWithoutUsuarioInput>
    create: XOR<RegistroSonoCreateWithoutUsuarioInput, RegistroSonoUncheckedCreateWithoutUsuarioInput>
  }

  export type RegistroSonoUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: RegistroSonoWhereUniqueInput
    data: XOR<RegistroSonoUpdateWithoutUsuarioInput, RegistroSonoUncheckedUpdateWithoutUsuarioInput>
  }

  export type RegistroSonoUpdateManyWithWhereWithoutUsuarioInput = {
    where: RegistroSonoScalarWhereInput
    data: XOR<RegistroSonoUpdateManyMutationInput, RegistroSonoUncheckedUpdateManyWithoutUsuarioInput>
  }

  export type RegistroSonoScalarWhereInput = {
    AND?: RegistroSonoScalarWhereInput | RegistroSonoScalarWhereInput[]
    OR?: RegistroSonoScalarWhereInput[]
    NOT?: RegistroSonoScalarWhereInput | RegistroSonoScalarWhereInput[]
    id?: StringFilter<"RegistroSono"> | string
    inicio?: DateTimeFilter<"RegistroSono"> | Date | string
    fim?: DateTimeNullableFilter<"RegistroSono"> | Date | string | null
    qualidade?: IntNullableFilter<"RegistroSono"> | number | null
    notas?: StringNullableFilter<"RegistroSono"> | string | null
    usuarioId?: StringFilter<"RegistroSono"> | string
  }

  export type UsuarioCreateWithoutRefeicoesInput = {
    id?: string
    email: string
    nome: string
    createdAt?: Date | string
    updatedAt?: Date | string
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: number
    metaTarefasPrioritarias?: number
    metaCoposAgua?: number
    metaPausasProgramadas?: number
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
    lembretesSono?: LembreteSonoCreateNestedManyWithoutUsuarioInput
    receitas?: ReceitaCreateNestedManyWithoutUsuarioInput
    receitasFavoritas?: ReceitaFavoritaCreateNestedManyWithoutUsuarioInput
    registrosRefeicao?: RegistroRefeicaoCreateNestedManyWithoutUsuarioInput
    registrosSono?: RegistroSonoCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutRefeicoesInput = {
    id?: string
    email: string
    nome: string
    createdAt?: Date | string
    updatedAt?: Date | string
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: number
    metaTarefasPrioritarias?: number
    metaCoposAgua?: number
    metaPausasProgramadas?: number
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
    lembretesSono?: LembreteSonoUncheckedCreateNestedManyWithoutUsuarioInput
    receitas?: ReceitaUncheckedCreateNestedManyWithoutUsuarioInput
    receitasFavoritas?: ReceitaFavoritaUncheckedCreateNestedManyWithoutUsuarioInput
    registrosRefeicao?: RegistroRefeicaoUncheckedCreateNestedManyWithoutUsuarioInput
    registrosSono?: RegistroSonoUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutRefeicoesInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutRefeicoesInput, UsuarioUncheckedCreateWithoutRefeicoesInput>
  }

  export type UsuarioUpsertWithoutRefeicoesInput = {
    update: XOR<UsuarioUpdateWithoutRefeicoesInput, UsuarioUncheckedUpdateWithoutRefeicoesInput>
    create: XOR<UsuarioCreateWithoutRefeicoesInput, UsuarioUncheckedCreateWithoutRefeicoesInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutRefeicoesInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutRefeicoesInput, UsuarioUncheckedUpdateWithoutRefeicoesInput>
  }

  export type UsuarioUpdateWithoutRefeicoesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    altoContraste?: BoolFieldUpdateOperationsInput | boolean
    reducaoEstimulos?: BoolFieldUpdateOperationsInput | boolean
    textoGrande?: BoolFieldUpdateOperationsInput | boolean
    metaHorasSono?: IntFieldUpdateOperationsInput | number
    metaTarefasPrioritarias?: IntFieldUpdateOperationsInput | number
    metaCoposAgua?: IntFieldUpdateOperationsInput | number
    metaPausasProgramadas?: IntFieldUpdateOperationsInput | number
    notificacoesAtivas?: BoolFieldUpdateOperationsInput | boolean
    pausasAtivas?: BoolFieldUpdateOperationsInput | boolean
    lembretesSono?: LembreteSonoUpdateManyWithoutUsuarioNestedInput
    receitas?: ReceitaUpdateManyWithoutUsuarioNestedInput
    receitasFavoritas?: ReceitaFavoritaUpdateManyWithoutUsuarioNestedInput
    registrosRefeicao?: RegistroRefeicaoUpdateManyWithoutUsuarioNestedInput
    registrosSono?: RegistroSonoUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutRefeicoesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    altoContraste?: BoolFieldUpdateOperationsInput | boolean
    reducaoEstimulos?: BoolFieldUpdateOperationsInput | boolean
    textoGrande?: BoolFieldUpdateOperationsInput | boolean
    metaHorasSono?: IntFieldUpdateOperationsInput | number
    metaTarefasPrioritarias?: IntFieldUpdateOperationsInput | number
    metaCoposAgua?: IntFieldUpdateOperationsInput | number
    metaPausasProgramadas?: IntFieldUpdateOperationsInput | number
    notificacoesAtivas?: BoolFieldUpdateOperationsInput | boolean
    pausasAtivas?: BoolFieldUpdateOperationsInput | boolean
    lembretesSono?: LembreteSonoUncheckedUpdateManyWithoutUsuarioNestedInput
    receitas?: ReceitaUncheckedUpdateManyWithoutUsuarioNestedInput
    receitasFavoritas?: ReceitaFavoritaUncheckedUpdateManyWithoutUsuarioNestedInput
    registrosRefeicao?: RegistroRefeicaoUncheckedUpdateManyWithoutUsuarioNestedInput
    registrosSono?: RegistroSonoUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioCreateWithoutRegistrosRefeicaoInput = {
    id?: string
    email: string
    nome: string
    createdAt?: Date | string
    updatedAt?: Date | string
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: number
    metaTarefasPrioritarias?: number
    metaCoposAgua?: number
    metaPausasProgramadas?: number
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
    lembretesSono?: LembreteSonoCreateNestedManyWithoutUsuarioInput
    receitas?: ReceitaCreateNestedManyWithoutUsuarioInput
    receitasFavoritas?: ReceitaFavoritaCreateNestedManyWithoutUsuarioInput
    refeicoes?: RefeicaoCreateNestedManyWithoutUsuarioInput
    registrosSono?: RegistroSonoCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutRegistrosRefeicaoInput = {
    id?: string
    email: string
    nome: string
    createdAt?: Date | string
    updatedAt?: Date | string
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: number
    metaTarefasPrioritarias?: number
    metaCoposAgua?: number
    metaPausasProgramadas?: number
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
    lembretesSono?: LembreteSonoUncheckedCreateNestedManyWithoutUsuarioInput
    receitas?: ReceitaUncheckedCreateNestedManyWithoutUsuarioInput
    receitasFavoritas?: ReceitaFavoritaUncheckedCreateNestedManyWithoutUsuarioInput
    refeicoes?: RefeicaoUncheckedCreateNestedManyWithoutUsuarioInput
    registrosSono?: RegistroSonoUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutRegistrosRefeicaoInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutRegistrosRefeicaoInput, UsuarioUncheckedCreateWithoutRegistrosRefeicaoInput>
  }

  export type UsuarioUpsertWithoutRegistrosRefeicaoInput = {
    update: XOR<UsuarioUpdateWithoutRegistrosRefeicaoInput, UsuarioUncheckedUpdateWithoutRegistrosRefeicaoInput>
    create: XOR<UsuarioCreateWithoutRegistrosRefeicaoInput, UsuarioUncheckedCreateWithoutRegistrosRefeicaoInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutRegistrosRefeicaoInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutRegistrosRefeicaoInput, UsuarioUncheckedUpdateWithoutRegistrosRefeicaoInput>
  }

  export type UsuarioUpdateWithoutRegistrosRefeicaoInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    altoContraste?: BoolFieldUpdateOperationsInput | boolean
    reducaoEstimulos?: BoolFieldUpdateOperationsInput | boolean
    textoGrande?: BoolFieldUpdateOperationsInput | boolean
    metaHorasSono?: IntFieldUpdateOperationsInput | number
    metaTarefasPrioritarias?: IntFieldUpdateOperationsInput | number
    metaCoposAgua?: IntFieldUpdateOperationsInput | number
    metaPausasProgramadas?: IntFieldUpdateOperationsInput | number
    notificacoesAtivas?: BoolFieldUpdateOperationsInput | boolean
    pausasAtivas?: BoolFieldUpdateOperationsInput | boolean
    lembretesSono?: LembreteSonoUpdateManyWithoutUsuarioNestedInput
    receitas?: ReceitaUpdateManyWithoutUsuarioNestedInput
    receitasFavoritas?: ReceitaFavoritaUpdateManyWithoutUsuarioNestedInput
    refeicoes?: RefeicaoUpdateManyWithoutUsuarioNestedInput
    registrosSono?: RegistroSonoUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutRegistrosRefeicaoInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    altoContraste?: BoolFieldUpdateOperationsInput | boolean
    reducaoEstimulos?: BoolFieldUpdateOperationsInput | boolean
    textoGrande?: BoolFieldUpdateOperationsInput | boolean
    metaHorasSono?: IntFieldUpdateOperationsInput | number
    metaTarefasPrioritarias?: IntFieldUpdateOperationsInput | number
    metaCoposAgua?: IntFieldUpdateOperationsInput | number
    metaPausasProgramadas?: IntFieldUpdateOperationsInput | number
    notificacoesAtivas?: BoolFieldUpdateOperationsInput | boolean
    pausasAtivas?: BoolFieldUpdateOperationsInput | boolean
    lembretesSono?: LembreteSonoUncheckedUpdateManyWithoutUsuarioNestedInput
    receitas?: ReceitaUncheckedUpdateManyWithoutUsuarioNestedInput
    receitasFavoritas?: ReceitaFavoritaUncheckedUpdateManyWithoutUsuarioNestedInput
    refeicoes?: RefeicaoUncheckedUpdateManyWithoutUsuarioNestedInput
    registrosSono?: RegistroSonoUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioCreateWithoutRegistrosSonoInput = {
    id?: string
    email: string
    nome: string
    createdAt?: Date | string
    updatedAt?: Date | string
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: number
    metaTarefasPrioritarias?: number
    metaCoposAgua?: number
    metaPausasProgramadas?: number
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
    lembretesSono?: LembreteSonoCreateNestedManyWithoutUsuarioInput
    receitas?: ReceitaCreateNestedManyWithoutUsuarioInput
    receitasFavoritas?: ReceitaFavoritaCreateNestedManyWithoutUsuarioInput
    refeicoes?: RefeicaoCreateNestedManyWithoutUsuarioInput
    registrosRefeicao?: RegistroRefeicaoCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutRegistrosSonoInput = {
    id?: string
    email: string
    nome: string
    createdAt?: Date | string
    updatedAt?: Date | string
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: number
    metaTarefasPrioritarias?: number
    metaCoposAgua?: number
    metaPausasProgramadas?: number
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
    lembretesSono?: LembreteSonoUncheckedCreateNestedManyWithoutUsuarioInput
    receitas?: ReceitaUncheckedCreateNestedManyWithoutUsuarioInput
    receitasFavoritas?: ReceitaFavoritaUncheckedCreateNestedManyWithoutUsuarioInput
    refeicoes?: RefeicaoUncheckedCreateNestedManyWithoutUsuarioInput
    registrosRefeicao?: RegistroRefeicaoUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutRegistrosSonoInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutRegistrosSonoInput, UsuarioUncheckedCreateWithoutRegistrosSonoInput>
  }

  export type UsuarioUpsertWithoutRegistrosSonoInput = {
    update: XOR<UsuarioUpdateWithoutRegistrosSonoInput, UsuarioUncheckedUpdateWithoutRegistrosSonoInput>
    create: XOR<UsuarioCreateWithoutRegistrosSonoInput, UsuarioUncheckedCreateWithoutRegistrosSonoInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutRegistrosSonoInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutRegistrosSonoInput, UsuarioUncheckedUpdateWithoutRegistrosSonoInput>
  }

  export type UsuarioUpdateWithoutRegistrosSonoInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    altoContraste?: BoolFieldUpdateOperationsInput | boolean
    reducaoEstimulos?: BoolFieldUpdateOperationsInput | boolean
    textoGrande?: BoolFieldUpdateOperationsInput | boolean
    metaHorasSono?: IntFieldUpdateOperationsInput | number
    metaTarefasPrioritarias?: IntFieldUpdateOperationsInput | number
    metaCoposAgua?: IntFieldUpdateOperationsInput | number
    metaPausasProgramadas?: IntFieldUpdateOperationsInput | number
    notificacoesAtivas?: BoolFieldUpdateOperationsInput | boolean
    pausasAtivas?: BoolFieldUpdateOperationsInput | boolean
    lembretesSono?: LembreteSonoUpdateManyWithoutUsuarioNestedInput
    receitas?: ReceitaUpdateManyWithoutUsuarioNestedInput
    receitasFavoritas?: ReceitaFavoritaUpdateManyWithoutUsuarioNestedInput
    refeicoes?: RefeicaoUpdateManyWithoutUsuarioNestedInput
    registrosRefeicao?: RegistroRefeicaoUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutRegistrosSonoInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    altoContraste?: BoolFieldUpdateOperationsInput | boolean
    reducaoEstimulos?: BoolFieldUpdateOperationsInput | boolean
    textoGrande?: BoolFieldUpdateOperationsInput | boolean
    metaHorasSono?: IntFieldUpdateOperationsInput | number
    metaTarefasPrioritarias?: IntFieldUpdateOperationsInput | number
    metaCoposAgua?: IntFieldUpdateOperationsInput | number
    metaPausasProgramadas?: IntFieldUpdateOperationsInput | number
    notificacoesAtivas?: BoolFieldUpdateOperationsInput | boolean
    pausasAtivas?: BoolFieldUpdateOperationsInput | boolean
    lembretesSono?: LembreteSonoUncheckedUpdateManyWithoutUsuarioNestedInput
    receitas?: ReceitaUncheckedUpdateManyWithoutUsuarioNestedInput
    receitasFavoritas?: ReceitaFavoritaUncheckedUpdateManyWithoutUsuarioNestedInput
    refeicoes?: RefeicaoUncheckedUpdateManyWithoutUsuarioNestedInput
    registrosRefeicao?: RegistroRefeicaoUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioCreateWithoutLembretesSonoInput = {
    id?: string
    email: string
    nome: string
    createdAt?: Date | string
    updatedAt?: Date | string
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: number
    metaTarefasPrioritarias?: number
    metaCoposAgua?: number
    metaPausasProgramadas?: number
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
    receitas?: ReceitaCreateNestedManyWithoutUsuarioInput
    receitasFavoritas?: ReceitaFavoritaCreateNestedManyWithoutUsuarioInput
    refeicoes?: RefeicaoCreateNestedManyWithoutUsuarioInput
    registrosRefeicao?: RegistroRefeicaoCreateNestedManyWithoutUsuarioInput
    registrosSono?: RegistroSonoCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutLembretesSonoInput = {
    id?: string
    email: string
    nome: string
    createdAt?: Date | string
    updatedAt?: Date | string
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: number
    metaTarefasPrioritarias?: number
    metaCoposAgua?: number
    metaPausasProgramadas?: number
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
    receitas?: ReceitaUncheckedCreateNestedManyWithoutUsuarioInput
    receitasFavoritas?: ReceitaFavoritaUncheckedCreateNestedManyWithoutUsuarioInput
    refeicoes?: RefeicaoUncheckedCreateNestedManyWithoutUsuarioInput
    registrosRefeicao?: RegistroRefeicaoUncheckedCreateNestedManyWithoutUsuarioInput
    registrosSono?: RegistroSonoUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutLembretesSonoInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutLembretesSonoInput, UsuarioUncheckedCreateWithoutLembretesSonoInput>
  }

  export type UsuarioUpsertWithoutLembretesSonoInput = {
    update: XOR<UsuarioUpdateWithoutLembretesSonoInput, UsuarioUncheckedUpdateWithoutLembretesSonoInput>
    create: XOR<UsuarioCreateWithoutLembretesSonoInput, UsuarioUncheckedCreateWithoutLembretesSonoInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutLembretesSonoInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutLembretesSonoInput, UsuarioUncheckedUpdateWithoutLembretesSonoInput>
  }

  export type UsuarioUpdateWithoutLembretesSonoInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    altoContraste?: BoolFieldUpdateOperationsInput | boolean
    reducaoEstimulos?: BoolFieldUpdateOperationsInput | boolean
    textoGrande?: BoolFieldUpdateOperationsInput | boolean
    metaHorasSono?: IntFieldUpdateOperationsInput | number
    metaTarefasPrioritarias?: IntFieldUpdateOperationsInput | number
    metaCoposAgua?: IntFieldUpdateOperationsInput | number
    metaPausasProgramadas?: IntFieldUpdateOperationsInput | number
    notificacoesAtivas?: BoolFieldUpdateOperationsInput | boolean
    pausasAtivas?: BoolFieldUpdateOperationsInput | boolean
    receitas?: ReceitaUpdateManyWithoutUsuarioNestedInput
    receitasFavoritas?: ReceitaFavoritaUpdateManyWithoutUsuarioNestedInput
    refeicoes?: RefeicaoUpdateManyWithoutUsuarioNestedInput
    registrosRefeicao?: RegistroRefeicaoUpdateManyWithoutUsuarioNestedInput
    registrosSono?: RegistroSonoUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutLembretesSonoInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    altoContraste?: BoolFieldUpdateOperationsInput | boolean
    reducaoEstimulos?: BoolFieldUpdateOperationsInput | boolean
    textoGrande?: BoolFieldUpdateOperationsInput | boolean
    metaHorasSono?: IntFieldUpdateOperationsInput | number
    metaTarefasPrioritarias?: IntFieldUpdateOperationsInput | number
    metaCoposAgua?: IntFieldUpdateOperationsInput | number
    metaPausasProgramadas?: IntFieldUpdateOperationsInput | number
    notificacoesAtivas?: BoolFieldUpdateOperationsInput | boolean
    pausasAtivas?: BoolFieldUpdateOperationsInput | boolean
    receitas?: ReceitaUncheckedUpdateManyWithoutUsuarioNestedInput
    receitasFavoritas?: ReceitaFavoritaUncheckedUpdateManyWithoutUsuarioNestedInput
    refeicoes?: RefeicaoUncheckedUpdateManyWithoutUsuarioNestedInput
    registrosRefeicao?: RegistroRefeicaoUncheckedUpdateManyWithoutUsuarioNestedInput
    registrosSono?: RegistroSonoUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type IngredienteCreateWithoutReceitaInput = {
    id?: string
    nome: string
    quantidade: number
    unidade: string
  }

  export type IngredienteUncheckedCreateWithoutReceitaInput = {
    id?: string
    nome: string
    quantidade: number
    unidade: string
  }

  export type IngredienteCreateOrConnectWithoutReceitaInput = {
    where: IngredienteWhereUniqueInput
    create: XOR<IngredienteCreateWithoutReceitaInput, IngredienteUncheckedCreateWithoutReceitaInput>
  }

  export type IngredienteCreateManyReceitaInputEnvelope = {
    data: IngredienteCreateManyReceitaInput | IngredienteCreateManyReceitaInput[]
    skipDuplicates?: boolean
  }

  export type PassoReceitaCreateWithoutReceitaInput = {
    id?: string
    ordem: number
    descricao: string
  }

  export type PassoReceitaUncheckedCreateWithoutReceitaInput = {
    id?: string
    ordem: number
    descricao: string
  }

  export type PassoReceitaCreateOrConnectWithoutReceitaInput = {
    where: PassoReceitaWhereUniqueInput
    create: XOR<PassoReceitaCreateWithoutReceitaInput, PassoReceitaUncheckedCreateWithoutReceitaInput>
  }

  export type PassoReceitaCreateManyReceitaInputEnvelope = {
    data: PassoReceitaCreateManyReceitaInput | PassoReceitaCreateManyReceitaInput[]
    skipDuplicates?: boolean
  }

  export type UsuarioCreateWithoutReceitasInput = {
    id?: string
    email: string
    nome: string
    createdAt?: Date | string
    updatedAt?: Date | string
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: number
    metaTarefasPrioritarias?: number
    metaCoposAgua?: number
    metaPausasProgramadas?: number
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
    lembretesSono?: LembreteSonoCreateNestedManyWithoutUsuarioInput
    receitasFavoritas?: ReceitaFavoritaCreateNestedManyWithoutUsuarioInput
    refeicoes?: RefeicaoCreateNestedManyWithoutUsuarioInput
    registrosRefeicao?: RegistroRefeicaoCreateNestedManyWithoutUsuarioInput
    registrosSono?: RegistroSonoCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutReceitasInput = {
    id?: string
    email: string
    nome: string
    createdAt?: Date | string
    updatedAt?: Date | string
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: number
    metaTarefasPrioritarias?: number
    metaCoposAgua?: number
    metaPausasProgramadas?: number
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
    lembretesSono?: LembreteSonoUncheckedCreateNestedManyWithoutUsuarioInput
    receitasFavoritas?: ReceitaFavoritaUncheckedCreateNestedManyWithoutUsuarioInput
    refeicoes?: RefeicaoUncheckedCreateNestedManyWithoutUsuarioInput
    registrosRefeicao?: RegistroRefeicaoUncheckedCreateNestedManyWithoutUsuarioInput
    registrosSono?: RegistroSonoUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutReceitasInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutReceitasInput, UsuarioUncheckedCreateWithoutReceitasInput>
  }

  export type ReceitaFavoritaCreateWithoutReceitaInput = {
    id?: string
    usuario: UsuarioCreateNestedOneWithoutReceitasFavoritasInput
  }

  export type ReceitaFavoritaUncheckedCreateWithoutReceitaInput = {
    id?: string
    usuarioId: string
  }

  export type ReceitaFavoritaCreateOrConnectWithoutReceitaInput = {
    where: ReceitaFavoritaWhereUniqueInput
    create: XOR<ReceitaFavoritaCreateWithoutReceitaInput, ReceitaFavoritaUncheckedCreateWithoutReceitaInput>
  }

  export type ReceitaFavoritaCreateManyReceitaInputEnvelope = {
    data: ReceitaFavoritaCreateManyReceitaInput | ReceitaFavoritaCreateManyReceitaInput[]
    skipDuplicates?: boolean
  }

  export type IngredienteUpsertWithWhereUniqueWithoutReceitaInput = {
    where: IngredienteWhereUniqueInput
    update: XOR<IngredienteUpdateWithoutReceitaInput, IngredienteUncheckedUpdateWithoutReceitaInput>
    create: XOR<IngredienteCreateWithoutReceitaInput, IngredienteUncheckedCreateWithoutReceitaInput>
  }

  export type IngredienteUpdateWithWhereUniqueWithoutReceitaInput = {
    where: IngredienteWhereUniqueInput
    data: XOR<IngredienteUpdateWithoutReceitaInput, IngredienteUncheckedUpdateWithoutReceitaInput>
  }

  export type IngredienteUpdateManyWithWhereWithoutReceitaInput = {
    where: IngredienteScalarWhereInput
    data: XOR<IngredienteUpdateManyMutationInput, IngredienteUncheckedUpdateManyWithoutReceitaInput>
  }

  export type IngredienteScalarWhereInput = {
    AND?: IngredienteScalarWhereInput | IngredienteScalarWhereInput[]
    OR?: IngredienteScalarWhereInput[]
    NOT?: IngredienteScalarWhereInput | IngredienteScalarWhereInput[]
    id?: StringFilter<"Ingrediente"> | string
    nome?: StringFilter<"Ingrediente"> | string
    quantidade?: FloatFilter<"Ingrediente"> | number
    unidade?: StringFilter<"Ingrediente"> | string
    receitaId?: StringFilter<"Ingrediente"> | string
  }

  export type PassoReceitaUpsertWithWhereUniqueWithoutReceitaInput = {
    where: PassoReceitaWhereUniqueInput
    update: XOR<PassoReceitaUpdateWithoutReceitaInput, PassoReceitaUncheckedUpdateWithoutReceitaInput>
    create: XOR<PassoReceitaCreateWithoutReceitaInput, PassoReceitaUncheckedCreateWithoutReceitaInput>
  }

  export type PassoReceitaUpdateWithWhereUniqueWithoutReceitaInput = {
    where: PassoReceitaWhereUniqueInput
    data: XOR<PassoReceitaUpdateWithoutReceitaInput, PassoReceitaUncheckedUpdateWithoutReceitaInput>
  }

  export type PassoReceitaUpdateManyWithWhereWithoutReceitaInput = {
    where: PassoReceitaScalarWhereInput
    data: XOR<PassoReceitaUpdateManyMutationInput, PassoReceitaUncheckedUpdateManyWithoutReceitaInput>
  }

  export type PassoReceitaScalarWhereInput = {
    AND?: PassoReceitaScalarWhereInput | PassoReceitaScalarWhereInput[]
    OR?: PassoReceitaScalarWhereInput[]
    NOT?: PassoReceitaScalarWhereInput | PassoReceitaScalarWhereInput[]
    id?: StringFilter<"PassoReceita"> | string
    ordem?: IntFilter<"PassoReceita"> | number
    descricao?: StringFilter<"PassoReceita"> | string
    receitaId?: StringFilter<"PassoReceita"> | string
  }

  export type UsuarioUpsertWithoutReceitasInput = {
    update: XOR<UsuarioUpdateWithoutReceitasInput, UsuarioUncheckedUpdateWithoutReceitasInput>
    create: XOR<UsuarioCreateWithoutReceitasInput, UsuarioUncheckedCreateWithoutReceitasInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutReceitasInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutReceitasInput, UsuarioUncheckedUpdateWithoutReceitasInput>
  }

  export type UsuarioUpdateWithoutReceitasInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    altoContraste?: BoolFieldUpdateOperationsInput | boolean
    reducaoEstimulos?: BoolFieldUpdateOperationsInput | boolean
    textoGrande?: BoolFieldUpdateOperationsInput | boolean
    metaHorasSono?: IntFieldUpdateOperationsInput | number
    metaTarefasPrioritarias?: IntFieldUpdateOperationsInput | number
    metaCoposAgua?: IntFieldUpdateOperationsInput | number
    metaPausasProgramadas?: IntFieldUpdateOperationsInput | number
    notificacoesAtivas?: BoolFieldUpdateOperationsInput | boolean
    pausasAtivas?: BoolFieldUpdateOperationsInput | boolean
    lembretesSono?: LembreteSonoUpdateManyWithoutUsuarioNestedInput
    receitasFavoritas?: ReceitaFavoritaUpdateManyWithoutUsuarioNestedInput
    refeicoes?: RefeicaoUpdateManyWithoutUsuarioNestedInput
    registrosRefeicao?: RegistroRefeicaoUpdateManyWithoutUsuarioNestedInput
    registrosSono?: RegistroSonoUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutReceitasInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    altoContraste?: BoolFieldUpdateOperationsInput | boolean
    reducaoEstimulos?: BoolFieldUpdateOperationsInput | boolean
    textoGrande?: BoolFieldUpdateOperationsInput | boolean
    metaHorasSono?: IntFieldUpdateOperationsInput | number
    metaTarefasPrioritarias?: IntFieldUpdateOperationsInput | number
    metaCoposAgua?: IntFieldUpdateOperationsInput | number
    metaPausasProgramadas?: IntFieldUpdateOperationsInput | number
    notificacoesAtivas?: BoolFieldUpdateOperationsInput | boolean
    pausasAtivas?: BoolFieldUpdateOperationsInput | boolean
    lembretesSono?: LembreteSonoUncheckedUpdateManyWithoutUsuarioNestedInput
    receitasFavoritas?: ReceitaFavoritaUncheckedUpdateManyWithoutUsuarioNestedInput
    refeicoes?: RefeicaoUncheckedUpdateManyWithoutUsuarioNestedInput
    registrosRefeicao?: RegistroRefeicaoUncheckedUpdateManyWithoutUsuarioNestedInput
    registrosSono?: RegistroSonoUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type ReceitaFavoritaUpsertWithWhereUniqueWithoutReceitaInput = {
    where: ReceitaFavoritaWhereUniqueInput
    update: XOR<ReceitaFavoritaUpdateWithoutReceitaInput, ReceitaFavoritaUncheckedUpdateWithoutReceitaInput>
    create: XOR<ReceitaFavoritaCreateWithoutReceitaInput, ReceitaFavoritaUncheckedCreateWithoutReceitaInput>
  }

  export type ReceitaFavoritaUpdateWithWhereUniqueWithoutReceitaInput = {
    where: ReceitaFavoritaWhereUniqueInput
    data: XOR<ReceitaFavoritaUpdateWithoutReceitaInput, ReceitaFavoritaUncheckedUpdateWithoutReceitaInput>
  }

  export type ReceitaFavoritaUpdateManyWithWhereWithoutReceitaInput = {
    where: ReceitaFavoritaScalarWhereInput
    data: XOR<ReceitaFavoritaUpdateManyMutationInput, ReceitaFavoritaUncheckedUpdateManyWithoutReceitaInput>
  }

  export type ReceitaCreateWithoutIngredientesInput = {
    id?: string
    nome: string
    descricao: string
    categorias?: ReceitaCreatecategoriasInput | string[]
    tags?: ReceitaCreatetagsInput | string[]
    tempoPreparo: number
    porcoes: number
    calorias: string
    imagem?: string | null
    passos?: PassoReceitaCreateNestedManyWithoutReceitaInput
    usuario: UsuarioCreateNestedOneWithoutReceitasInput
    favoritos?: ReceitaFavoritaCreateNestedManyWithoutReceitaInput
  }

  export type ReceitaUncheckedCreateWithoutIngredientesInput = {
    id?: string
    nome: string
    descricao: string
    categorias?: ReceitaCreatecategoriasInput | string[]
    tags?: ReceitaCreatetagsInput | string[]
    tempoPreparo: number
    porcoes: number
    calorias: string
    imagem?: string | null
    usuarioId: string
    passos?: PassoReceitaUncheckedCreateNestedManyWithoutReceitaInput
    favoritos?: ReceitaFavoritaUncheckedCreateNestedManyWithoutReceitaInput
  }

  export type ReceitaCreateOrConnectWithoutIngredientesInput = {
    where: ReceitaWhereUniqueInput
    create: XOR<ReceitaCreateWithoutIngredientesInput, ReceitaUncheckedCreateWithoutIngredientesInput>
  }

  export type ReceitaUpsertWithoutIngredientesInput = {
    update: XOR<ReceitaUpdateWithoutIngredientesInput, ReceitaUncheckedUpdateWithoutIngredientesInput>
    create: XOR<ReceitaCreateWithoutIngredientesInput, ReceitaUncheckedCreateWithoutIngredientesInput>
    where?: ReceitaWhereInput
  }

  export type ReceitaUpdateToOneWithWhereWithoutIngredientesInput = {
    where?: ReceitaWhereInput
    data: XOR<ReceitaUpdateWithoutIngredientesInput, ReceitaUncheckedUpdateWithoutIngredientesInput>
  }

  export type ReceitaUpdateWithoutIngredientesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    categorias?: ReceitaUpdatecategoriasInput | string[]
    tags?: ReceitaUpdatetagsInput | string[]
    tempoPreparo?: IntFieldUpdateOperationsInput | number
    porcoes?: IntFieldUpdateOperationsInput | number
    calorias?: StringFieldUpdateOperationsInput | string
    imagem?: NullableStringFieldUpdateOperationsInput | string | null
    passos?: PassoReceitaUpdateManyWithoutReceitaNestedInput
    usuario?: UsuarioUpdateOneRequiredWithoutReceitasNestedInput
    favoritos?: ReceitaFavoritaUpdateManyWithoutReceitaNestedInput
  }

  export type ReceitaUncheckedUpdateWithoutIngredientesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    categorias?: ReceitaUpdatecategoriasInput | string[]
    tags?: ReceitaUpdatetagsInput | string[]
    tempoPreparo?: IntFieldUpdateOperationsInput | number
    porcoes?: IntFieldUpdateOperationsInput | number
    calorias?: StringFieldUpdateOperationsInput | string
    imagem?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
    passos?: PassoReceitaUncheckedUpdateManyWithoutReceitaNestedInput
    favoritos?: ReceitaFavoritaUncheckedUpdateManyWithoutReceitaNestedInput
  }

  export type ReceitaCreateWithoutPassosInput = {
    id?: string
    nome: string
    descricao: string
    categorias?: ReceitaCreatecategoriasInput | string[]
    tags?: ReceitaCreatetagsInput | string[]
    tempoPreparo: number
    porcoes: number
    calorias: string
    imagem?: string | null
    ingredientes?: IngredienteCreateNestedManyWithoutReceitaInput
    usuario: UsuarioCreateNestedOneWithoutReceitasInput
    favoritos?: ReceitaFavoritaCreateNestedManyWithoutReceitaInput
  }

  export type ReceitaUncheckedCreateWithoutPassosInput = {
    id?: string
    nome: string
    descricao: string
    categorias?: ReceitaCreatecategoriasInput | string[]
    tags?: ReceitaCreatetagsInput | string[]
    tempoPreparo: number
    porcoes: number
    calorias: string
    imagem?: string | null
    usuarioId: string
    ingredientes?: IngredienteUncheckedCreateNestedManyWithoutReceitaInput
    favoritos?: ReceitaFavoritaUncheckedCreateNestedManyWithoutReceitaInput
  }

  export type ReceitaCreateOrConnectWithoutPassosInput = {
    where: ReceitaWhereUniqueInput
    create: XOR<ReceitaCreateWithoutPassosInput, ReceitaUncheckedCreateWithoutPassosInput>
  }

  export type ReceitaUpsertWithoutPassosInput = {
    update: XOR<ReceitaUpdateWithoutPassosInput, ReceitaUncheckedUpdateWithoutPassosInput>
    create: XOR<ReceitaCreateWithoutPassosInput, ReceitaUncheckedCreateWithoutPassosInput>
    where?: ReceitaWhereInput
  }

  export type ReceitaUpdateToOneWithWhereWithoutPassosInput = {
    where?: ReceitaWhereInput
    data: XOR<ReceitaUpdateWithoutPassosInput, ReceitaUncheckedUpdateWithoutPassosInput>
  }

  export type ReceitaUpdateWithoutPassosInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    categorias?: ReceitaUpdatecategoriasInput | string[]
    tags?: ReceitaUpdatetagsInput | string[]
    tempoPreparo?: IntFieldUpdateOperationsInput | number
    porcoes?: IntFieldUpdateOperationsInput | number
    calorias?: StringFieldUpdateOperationsInput | string
    imagem?: NullableStringFieldUpdateOperationsInput | string | null
    ingredientes?: IngredienteUpdateManyWithoutReceitaNestedInput
    usuario?: UsuarioUpdateOneRequiredWithoutReceitasNestedInput
    favoritos?: ReceitaFavoritaUpdateManyWithoutReceitaNestedInput
  }

  export type ReceitaUncheckedUpdateWithoutPassosInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    categorias?: ReceitaUpdatecategoriasInput | string[]
    tags?: ReceitaUpdatetagsInput | string[]
    tempoPreparo?: IntFieldUpdateOperationsInput | number
    porcoes?: IntFieldUpdateOperationsInput | number
    calorias?: StringFieldUpdateOperationsInput | string
    imagem?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
    ingredientes?: IngredienteUncheckedUpdateManyWithoutReceitaNestedInput
    favoritos?: ReceitaFavoritaUncheckedUpdateManyWithoutReceitaNestedInput
  }

  export type ReceitaCreateWithoutFavoritosInput = {
    id?: string
    nome: string
    descricao: string
    categorias?: ReceitaCreatecategoriasInput | string[]
    tags?: ReceitaCreatetagsInput | string[]
    tempoPreparo: number
    porcoes: number
    calorias: string
    imagem?: string | null
    ingredientes?: IngredienteCreateNestedManyWithoutReceitaInput
    passos?: PassoReceitaCreateNestedManyWithoutReceitaInput
    usuario: UsuarioCreateNestedOneWithoutReceitasInput
  }

  export type ReceitaUncheckedCreateWithoutFavoritosInput = {
    id?: string
    nome: string
    descricao: string
    categorias?: ReceitaCreatecategoriasInput | string[]
    tags?: ReceitaCreatetagsInput | string[]
    tempoPreparo: number
    porcoes: number
    calorias: string
    imagem?: string | null
    usuarioId: string
    ingredientes?: IngredienteUncheckedCreateNestedManyWithoutReceitaInput
    passos?: PassoReceitaUncheckedCreateNestedManyWithoutReceitaInput
  }

  export type ReceitaCreateOrConnectWithoutFavoritosInput = {
    where: ReceitaWhereUniqueInput
    create: XOR<ReceitaCreateWithoutFavoritosInput, ReceitaUncheckedCreateWithoutFavoritosInput>
  }

  export type UsuarioCreateWithoutReceitasFavoritasInput = {
    id?: string
    email: string
    nome: string
    createdAt?: Date | string
    updatedAt?: Date | string
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: number
    metaTarefasPrioritarias?: number
    metaCoposAgua?: number
    metaPausasProgramadas?: number
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
    lembretesSono?: LembreteSonoCreateNestedManyWithoutUsuarioInput
    receitas?: ReceitaCreateNestedManyWithoutUsuarioInput
    refeicoes?: RefeicaoCreateNestedManyWithoutUsuarioInput
    registrosRefeicao?: RegistroRefeicaoCreateNestedManyWithoutUsuarioInput
    registrosSono?: RegistroSonoCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutReceitasFavoritasInput = {
    id?: string
    email: string
    nome: string
    createdAt?: Date | string
    updatedAt?: Date | string
    altoContraste?: boolean
    reducaoEstimulos?: boolean
    textoGrande?: boolean
    metaHorasSono?: number
    metaTarefasPrioritarias?: number
    metaCoposAgua?: number
    metaPausasProgramadas?: number
    notificacoesAtivas?: boolean
    pausasAtivas?: boolean
    lembretesSono?: LembreteSonoUncheckedCreateNestedManyWithoutUsuarioInput
    receitas?: ReceitaUncheckedCreateNestedManyWithoutUsuarioInput
    refeicoes?: RefeicaoUncheckedCreateNestedManyWithoutUsuarioInput
    registrosRefeicao?: RegistroRefeicaoUncheckedCreateNestedManyWithoutUsuarioInput
    registrosSono?: RegistroSonoUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutReceitasFavoritasInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutReceitasFavoritasInput, UsuarioUncheckedCreateWithoutReceitasFavoritasInput>
  }

  export type ReceitaUpsertWithoutFavoritosInput = {
    update: XOR<ReceitaUpdateWithoutFavoritosInput, ReceitaUncheckedUpdateWithoutFavoritosInput>
    create: XOR<ReceitaCreateWithoutFavoritosInput, ReceitaUncheckedCreateWithoutFavoritosInput>
    where?: ReceitaWhereInput
  }

  export type ReceitaUpdateToOneWithWhereWithoutFavoritosInput = {
    where?: ReceitaWhereInput
    data: XOR<ReceitaUpdateWithoutFavoritosInput, ReceitaUncheckedUpdateWithoutFavoritosInput>
  }

  export type ReceitaUpdateWithoutFavoritosInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    categorias?: ReceitaUpdatecategoriasInput | string[]
    tags?: ReceitaUpdatetagsInput | string[]
    tempoPreparo?: IntFieldUpdateOperationsInput | number
    porcoes?: IntFieldUpdateOperationsInput | number
    calorias?: StringFieldUpdateOperationsInput | string
    imagem?: NullableStringFieldUpdateOperationsInput | string | null
    ingredientes?: IngredienteUpdateManyWithoutReceitaNestedInput
    passos?: PassoReceitaUpdateManyWithoutReceitaNestedInput
    usuario?: UsuarioUpdateOneRequiredWithoutReceitasNestedInput
  }

  export type ReceitaUncheckedUpdateWithoutFavoritosInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    categorias?: ReceitaUpdatecategoriasInput | string[]
    tags?: ReceitaUpdatetagsInput | string[]
    tempoPreparo?: IntFieldUpdateOperationsInput | number
    porcoes?: IntFieldUpdateOperationsInput | number
    calorias?: StringFieldUpdateOperationsInput | string
    imagem?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: StringFieldUpdateOperationsInput | string
    ingredientes?: IngredienteUncheckedUpdateManyWithoutReceitaNestedInput
    passos?: PassoReceitaUncheckedUpdateManyWithoutReceitaNestedInput
  }

  export type UsuarioUpsertWithoutReceitasFavoritasInput = {
    update: XOR<UsuarioUpdateWithoutReceitasFavoritasInput, UsuarioUncheckedUpdateWithoutReceitasFavoritasInput>
    create: XOR<UsuarioCreateWithoutReceitasFavoritasInput, UsuarioUncheckedCreateWithoutReceitasFavoritasInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutReceitasFavoritasInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutReceitasFavoritasInput, UsuarioUncheckedUpdateWithoutReceitasFavoritasInput>
  }

  export type UsuarioUpdateWithoutReceitasFavoritasInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    altoContraste?: BoolFieldUpdateOperationsInput | boolean
    reducaoEstimulos?: BoolFieldUpdateOperationsInput | boolean
    textoGrande?: BoolFieldUpdateOperationsInput | boolean
    metaHorasSono?: IntFieldUpdateOperationsInput | number
    metaTarefasPrioritarias?: IntFieldUpdateOperationsInput | number
    metaCoposAgua?: IntFieldUpdateOperationsInput | number
    metaPausasProgramadas?: IntFieldUpdateOperationsInput | number
    notificacoesAtivas?: BoolFieldUpdateOperationsInput | boolean
    pausasAtivas?: BoolFieldUpdateOperationsInput | boolean
    lembretesSono?: LembreteSonoUpdateManyWithoutUsuarioNestedInput
    receitas?: ReceitaUpdateManyWithoutUsuarioNestedInput
    refeicoes?: RefeicaoUpdateManyWithoutUsuarioNestedInput
    registrosRefeicao?: RegistroRefeicaoUpdateManyWithoutUsuarioNestedInput
    registrosSono?: RegistroSonoUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutReceitasFavoritasInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    altoContraste?: BoolFieldUpdateOperationsInput | boolean
    reducaoEstimulos?: BoolFieldUpdateOperationsInput | boolean
    textoGrande?: BoolFieldUpdateOperationsInput | boolean
    metaHorasSono?: IntFieldUpdateOperationsInput | number
    metaTarefasPrioritarias?: IntFieldUpdateOperationsInput | number
    metaCoposAgua?: IntFieldUpdateOperationsInput | number
    metaPausasProgramadas?: IntFieldUpdateOperationsInput | number
    notificacoesAtivas?: BoolFieldUpdateOperationsInput | boolean
    pausasAtivas?: BoolFieldUpdateOperationsInput | boolean
    lembretesSono?: LembreteSonoUncheckedUpdateManyWithoutUsuarioNestedInput
    receitas?: ReceitaUncheckedUpdateManyWithoutUsuarioNestedInput
    refeicoes?: RefeicaoUncheckedUpdateManyWithoutUsuarioNestedInput
    registrosRefeicao?: RegistroRefeicaoUncheckedUpdateManyWithoutUsuarioNestedInput
    registrosSono?: RegistroSonoUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type LembreteSonoCreateManyUsuarioInput = {
    id?: string
    tipo: string
    horario: string
    diasSemana?: LembreteSonoCreatediasSemanaInput | number[]
    ativo?: boolean
  }

  export type ReceitaCreateManyUsuarioInput = {
    id?: string
    nome: string
    descricao: string
    categorias?: ReceitaCreatecategoriasInput | string[]
    tags?: ReceitaCreatetagsInput | string[]
    tempoPreparo: number
    porcoes: number
    calorias: string
    imagem?: string | null
  }

  export type ReceitaFavoritaCreateManyUsuarioInput = {
    id?: string
    receitaId: string
  }

  export type RefeicaoCreateManyUsuarioInput = {
    id?: string
    horario: string
    descricao: string
  }

  export type RegistroRefeicaoCreateManyUsuarioInput = {
    id?: string
    data: Date | string
    horario: string
    descricao: string
    tipoIcone?: string | null
    foto?: string | null
  }

  export type RegistroSonoCreateManyUsuarioInput = {
    id?: string
    inicio: Date | string
    fim?: Date | string | null
    qualidade?: number | null
    notas?: string | null
  }

  export type LembreteSonoUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    horario?: StringFieldUpdateOperationsInput | string
    diasSemana?: LembreteSonoUpdatediasSemanaInput | number[]
    ativo?: BoolFieldUpdateOperationsInput | boolean
  }

  export type LembreteSonoUncheckedUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    horario?: StringFieldUpdateOperationsInput | string
    diasSemana?: LembreteSonoUpdatediasSemanaInput | number[]
    ativo?: BoolFieldUpdateOperationsInput | boolean
  }

  export type LembreteSonoUncheckedUpdateManyWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    horario?: StringFieldUpdateOperationsInput | string
    diasSemana?: LembreteSonoUpdatediasSemanaInput | number[]
    ativo?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ReceitaUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    categorias?: ReceitaUpdatecategoriasInput | string[]
    tags?: ReceitaUpdatetagsInput | string[]
    tempoPreparo?: IntFieldUpdateOperationsInput | number
    porcoes?: IntFieldUpdateOperationsInput | number
    calorias?: StringFieldUpdateOperationsInput | string
    imagem?: NullableStringFieldUpdateOperationsInput | string | null
    ingredientes?: IngredienteUpdateManyWithoutReceitaNestedInput
    passos?: PassoReceitaUpdateManyWithoutReceitaNestedInput
    favoritos?: ReceitaFavoritaUpdateManyWithoutReceitaNestedInput
  }

  export type ReceitaUncheckedUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    categorias?: ReceitaUpdatecategoriasInput | string[]
    tags?: ReceitaUpdatetagsInput | string[]
    tempoPreparo?: IntFieldUpdateOperationsInput | number
    porcoes?: IntFieldUpdateOperationsInput | number
    calorias?: StringFieldUpdateOperationsInput | string
    imagem?: NullableStringFieldUpdateOperationsInput | string | null
    ingredientes?: IngredienteUncheckedUpdateManyWithoutReceitaNestedInput
    passos?: PassoReceitaUncheckedUpdateManyWithoutReceitaNestedInput
    favoritos?: ReceitaFavoritaUncheckedUpdateManyWithoutReceitaNestedInput
  }

  export type ReceitaUncheckedUpdateManyWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    categorias?: ReceitaUpdatecategoriasInput | string[]
    tags?: ReceitaUpdatetagsInput | string[]
    tempoPreparo?: IntFieldUpdateOperationsInput | number
    porcoes?: IntFieldUpdateOperationsInput | number
    calorias?: StringFieldUpdateOperationsInput | string
    imagem?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ReceitaFavoritaUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    receita?: ReceitaUpdateOneRequiredWithoutFavoritosNestedInput
  }

  export type ReceitaFavoritaUncheckedUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    receitaId?: StringFieldUpdateOperationsInput | string
  }

  export type ReceitaFavoritaUncheckedUpdateManyWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    receitaId?: StringFieldUpdateOperationsInput | string
  }

  export type RefeicaoUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    horario?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
  }

  export type RefeicaoUncheckedUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    horario?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
  }

  export type RefeicaoUncheckedUpdateManyWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    horario?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
  }

  export type RegistroRefeicaoUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: DateTimeFieldUpdateOperationsInput | Date | string
    horario?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    tipoIcone?: NullableStringFieldUpdateOperationsInput | string | null
    foto?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RegistroRefeicaoUncheckedUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: DateTimeFieldUpdateOperationsInput | Date | string
    horario?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    tipoIcone?: NullableStringFieldUpdateOperationsInput | string | null
    foto?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RegistroRefeicaoUncheckedUpdateManyWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: DateTimeFieldUpdateOperationsInput | Date | string
    horario?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    tipoIcone?: NullableStringFieldUpdateOperationsInput | string | null
    foto?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RegistroSonoUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fim?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    qualidade?: NullableIntFieldUpdateOperationsInput | number | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RegistroSonoUncheckedUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fim?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    qualidade?: NullableIntFieldUpdateOperationsInput | number | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RegistroSonoUncheckedUpdateManyWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    inicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fim?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    qualidade?: NullableIntFieldUpdateOperationsInput | number | null
    notas?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type IngredienteCreateManyReceitaInput = {
    id?: string
    nome: string
    quantidade: number
    unidade: string
  }

  export type PassoReceitaCreateManyReceitaInput = {
    id?: string
    ordem: number
    descricao: string
  }

  export type ReceitaFavoritaCreateManyReceitaInput = {
    id?: string
    usuarioId: string
  }

  export type IngredienteUpdateWithoutReceitaInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    quantidade?: FloatFieldUpdateOperationsInput | number
    unidade?: StringFieldUpdateOperationsInput | string
  }

  export type IngredienteUncheckedUpdateWithoutReceitaInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    quantidade?: FloatFieldUpdateOperationsInput | number
    unidade?: StringFieldUpdateOperationsInput | string
  }

  export type IngredienteUncheckedUpdateManyWithoutReceitaInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    quantidade?: FloatFieldUpdateOperationsInput | number
    unidade?: StringFieldUpdateOperationsInput | string
  }

  export type PassoReceitaUpdateWithoutReceitaInput = {
    id?: StringFieldUpdateOperationsInput | string
    ordem?: IntFieldUpdateOperationsInput | number
    descricao?: StringFieldUpdateOperationsInput | string
  }

  export type PassoReceitaUncheckedUpdateWithoutReceitaInput = {
    id?: StringFieldUpdateOperationsInput | string
    ordem?: IntFieldUpdateOperationsInput | number
    descricao?: StringFieldUpdateOperationsInput | string
  }

  export type PassoReceitaUncheckedUpdateManyWithoutReceitaInput = {
    id?: StringFieldUpdateOperationsInput | string
    ordem?: IntFieldUpdateOperationsInput | number
    descricao?: StringFieldUpdateOperationsInput | string
  }

  export type ReceitaFavoritaUpdateWithoutReceitaInput = {
    id?: StringFieldUpdateOperationsInput | string
    usuario?: UsuarioUpdateOneRequiredWithoutReceitasFavoritasNestedInput
  }

  export type ReceitaFavoritaUncheckedUpdateWithoutReceitaInput = {
    id?: StringFieldUpdateOperationsInput | string
    usuarioId?: StringFieldUpdateOperationsInput | string
  }

  export type ReceitaFavoritaUncheckedUpdateManyWithoutReceitaInput = {
    id?: StringFieldUpdateOperationsInput | string
    usuarioId?: StringFieldUpdateOperationsInput | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}