// Woocommerce Rest API module
const WoocommerceRestApi = require('@woocommerce/woocommerce-rest-api').default

class WcHelpers {
	constructor(url, consumerKey, consumerSecret) {
		this.url = url
		this.consumerKey = consumerKey
		this.consumerSecret = consumerSecret
		this.api = new WoocommerceRestApi({
			url,
			consumerKey,
			consumerSecret,
			wpAPI: true,
			version: 'wc/v3'
		})
	}
	async check() {
		try {
			await this.api.get('system_status')
			return true
		} catch(err) {
			console.log(err.response.data)
			return false
		}
	}
	async getAllProducts() {
		try {
			let products = []
			let totalProducts = 0
			let totalPages = 1
			for (let page = 1; page <= totalPages; page++) {
				const { headers, data } = await this.api.get('products', {
					page: page,
					per_page: 100,
					orderby: 'id',
					order: 'asc'
				})

				if (page === 1) {
					totalPages = headers['x-wp-totalpages']
					totalProducts = headers['x-wp-total']
				}
				products.push(...data)
			}

			let variations = []
			let variationsID = products
					.filter(product => product.type === 'variable')
					.map(product => product.variations)
					.flat()

			for (let id of variationsID) {
				const { data } = await this.api.get(`products/${id}`)
				variations.push(data)
			}

			return { success: true, products, variations }
		} catch(err) {
			console.log('cannot fetch products from getAllProducts()')
			console.log(err)
			return { success: false }
		}
	}
	async updateProduct({id, onlinePrice, onlineSalePrice, onlineStock}) {
		const data = {
			regular_price: onlinePrice.toString(),
			sale_price: onlineSalePrice.toString(),
			stock_quantity: onlineStock
		}

		return this.api.put(`products/${id}`, data)
				.then(res => {
					return res.status === 200 && res.statusText === 'OK'
				})
				.catch(err => {
					console.log(err.response.data)
				})
	}
	async updateProductVariation({id, parentId, onlinePrice, onlineSalePrice, onlineStock}) {
		const data = {
			regular_price: onlinePrice.toString(),
			sale_price: onlineSalePrice.toString(),
			stock_quantity: onlineStock
		}

		return this.api.put(`products/${parentId}/variations/${id}`, data)
				.then(res => {
					return res.status === 200 && res.statusText === 'OK'
				})
				.catch(err => {
					console.log(err.response.data)
				})
	}
	async deleteProduct(id) {
		return this.api.delete(`products/${id}`, { force: true })
				.then(res => {
					return res.status === 200 && res.statusText === 'OK'
				})
				.catch(err => {
					console.log(err.response.data)
				})
	}
	async deleteProductVariation(id, parentId) {
		return this.api.delete(`products/${parentId}/variations/${id}`)
				.then(res => {
					return res.status === 200 && res.statusText === 'OK'
				})
				.catch(err => {
					console.log(err.response.data)
				})
	}
	async createWebhooks(businessId, businessKey) {
		try {
			const productBaseUrl = 'https://api-dev.pozitronet.ir/products/webhooks'
			const orderBaseUrl = 'https://api-dev.pozitronet.ir/orders/webhooks'
			const webhooks = [
					{ name: 'product create', topic: 'product.created', delivery_url: `${productBaseUrl}/create/${businessId}/${businessKey}` },
					{ name: 'product update', topic: 'product.updated', delivery_url: `${productBaseUrl}/create/${businessId}/${businessKey}` },
					{ name: 'product delete', topic: 'product.deleted', delivery_url: `${productBaseUrl}/create/${businessId}/${businessKey}` },
					{ name: 'order create', topic: 'order.created', delivery_url: `${orderBaseUrl}/create/${businessId}/${businessKey}` },
					{ name: 'order update', topic: 'order.updated', delivery_url: `${orderBaseUrl}/create/${businessId}/${businessKey}` },
					{ name: 'order delete', topic: 'order.deleted', delivery_url: `${orderBaseUrl}/create/${businessId}/${businessKey}` }
			]
			await Promise.all([
				await this.api.post('webhooks', webhooks[0]),
				await this.api.post('webhooks', webhooks[1]),
				await this.api.post('webhooks', webhooks[2]),
				await this.api.post('webhooks', webhooks[3]),
				await this.api.post('webhooks', webhooks[4]),
				await this.api.post('webhooks', webhooks[5]),
			])
			return true
		} catch(err) {
			console.log(`creating webhook has failed, with error:\n${err}`)
			return false
		}
	}
}

// export helper
module.exports = WcHelpers