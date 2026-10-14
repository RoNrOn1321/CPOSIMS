import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SettingController::index
 * @see app/Http/Controllers/Admin/SettingController.php:23
 * @route '/admin/settings'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SettingController::index
 * @see app/Http/Controllers/Admin/SettingController.php:23
 * @route '/admin/settings'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SettingController::index
 * @see app/Http/Controllers/Admin/SettingController.php:23
 * @route '/admin/settings'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SettingController::index
 * @see app/Http/Controllers/Admin/SettingController.php:23
 * @route '/admin/settings'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SettingController::storeUser
 * @see app/Http/Controllers/Admin/SettingController.php:69
 * @route '/admin/settings/users'
 */
export const storeUser = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeUser.url(options),
    method: 'post',
})

storeUser.definition = {
    methods: ["post"],
    url: '/admin/settings/users',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SettingController::storeUser
 * @see app/Http/Controllers/Admin/SettingController.php:69
 * @route '/admin/settings/users'
 */
storeUser.url = (options?: RouteQueryOptions) => {
    return storeUser.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SettingController::storeUser
 * @see app/Http/Controllers/Admin/SettingController.php:69
 * @route '/admin/settings/users'
 */
storeUser.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeUser.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SettingController::updateUser
 * @see app/Http/Controllers/Admin/SettingController.php:96
 * @route '/admin/settings/users/{user}'
 */
export const updateUser = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateUser.url(args, options),
    method: 'put',
})

updateUser.definition = {
    methods: ["put"],
    url: '/admin/settings/users/{user}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\SettingController::updateUser
 * @see app/Http/Controllers/Admin/SettingController.php:96
 * @route '/admin/settings/users/{user}'
 */
updateUser.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return updateUser.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SettingController::updateUser
 * @see app/Http/Controllers/Admin/SettingController.php:96
 * @route '/admin/settings/users/{user}'
 */
updateUser.put = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateUser.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\SettingController::storeCategory
 * @see app/Http/Controllers/Admin/SettingController.php:134
 * @route '/admin/settings/categories'
 */
export const storeCategory = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeCategory.url(options),
    method: 'post',
})

storeCategory.definition = {
    methods: ["post"],
    url: '/admin/settings/categories',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SettingController::storeCategory
 * @see app/Http/Controllers/Admin/SettingController.php:134
 * @route '/admin/settings/categories'
 */
storeCategory.url = (options?: RouteQueryOptions) => {
    return storeCategory.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SettingController::storeCategory
 * @see app/Http/Controllers/Admin/SettingController.php:134
 * @route '/admin/settings/categories'
 */
storeCategory.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeCategory.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SettingController::updateCategory
 * @see app/Http/Controllers/Admin/SettingController.php:150
 * @route '/admin/settings/categories/{category}'
 */
export const updateCategory = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateCategory.url(args, options),
    method: 'put',
})

updateCategory.definition = {
    methods: ["put"],
    url: '/admin/settings/categories/{category}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\SettingController::updateCategory
 * @see app/Http/Controllers/Admin/SettingController.php:150
 * @route '/admin/settings/categories/{category}'
 */
updateCategory.url = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { category: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { category: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    category: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        category: typeof args.category === 'object'
                ? args.category.id
                : args.category,
                }

    return updateCategory.definition.url
            .replace('{category}', parsedArgs.category.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SettingController::updateCategory
 * @see app/Http/Controllers/Admin/SettingController.php:150
 * @route '/admin/settings/categories/{category}'
 */
updateCategory.put = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateCategory.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\SettingController::destroyCategory
 * @see app/Http/Controllers/Admin/SettingController.php:166
 * @route '/admin/settings/categories/{category}'
 */
export const destroyCategory = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyCategory.url(args, options),
    method: 'delete',
})

destroyCategory.definition = {
    methods: ["delete"],
    url: '/admin/settings/categories/{category}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\SettingController::destroyCategory
 * @see app/Http/Controllers/Admin/SettingController.php:166
 * @route '/admin/settings/categories/{category}'
 */
destroyCategory.url = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { category: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { category: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    category: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        category: typeof args.category === 'object'
                ? args.category.id
                : args.category,
                }

    return destroyCategory.definition.url
            .replace('{category}', parsedArgs.category.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SettingController::destroyCategory
 * @see app/Http/Controllers/Admin/SettingController.php:166
 * @route '/admin/settings/categories/{category}'
 */
destroyCategory.delete = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyCategory.url(args, options),
    method: 'delete',
})
const SettingController = { index, storeUser, updateUser, storeCategory, updateCategory, destroyCategory }

export default SettingController