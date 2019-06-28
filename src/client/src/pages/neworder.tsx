import React from 'react';
import { match, withRouter } from 'react-router-dom';
import { getAuthToken } from '../components/with_auth/with_auth';
import * as H from 'history';
import Cart from './images/cart.png';




/**
 * Interface for products
 */
interface ProductsItem {
    id: number;
    user: UserItem;
    supplier: SuppliersItem;
    name: string;
    unit: string;
    qty: number;
    deleted: boolean;
}

/**
 * Interface for Orders
 */
interface OrdersItem {
    id: number;
    user: UserItem;
    date: string;
    products: ProductsItem[];
    suppliers: SuppliersItem[];
    confirmed: boolean;
    favourite: string;
}

/**
 * Interface for Suppliers
 */
interface SuppliersItem {
    user: UserItem;
    id: number;
    email: string;
    companyName: string;
    products: ProductsItem[];
    orders: OrdersItem[];
    phoneNumber: string;
    contactName: string;
    emailSent: string;
    deleted: boolean;
}

/**
 * Interface for User
 */
interface UserItem {
    id: number;
    email: string;
    password: string;
    contactName: string;
    companyName: string;
    suppliers: SuppliersItem[];
    products: ProductsItem[];
    orders: OrdersItem[];
}

/**
 * Props for the page
 */
interface NewOrderPropsInternal {
    history: H.History;
    match: match<{ id: string }>
}

/**
 * State for the page
 */
interface NewOrderStateInternal {
    order: OrdersItem | null;
    user: UserItem | null;
    token: string | null;
    Suppliers: SuppliersItem[] | null;
    Products: ProductsItem[] | null;
    itemsList: ProductsItem[] | null;
    suppliersList: SuppliersItem[] | null;
    currentOrder: OrdersItem | null;
    currentSupplier: SuppliersItem | null;
    currentProduct: ProductsItem | null;
    currentItem: ProductsItem | null;
    currentQty: number | null;
    showOptions: boolean | null;
    showItemOption: boolean | null;
    queryProducts: string;
    querySuppliers: string;
    queryItems: string;
    error: string | null;
}

/**
 * Class constructor
 */
export class NewOrderInternal extends React.Component<NewOrderPropsInternal, NewOrderStateInternal> {
    public constructor(props: NewOrderPropsInternal) {
        super(props);
        this.state = {
            order: null,
            user: null,
            token: null,
            Suppliers: null,
            Products: null,
            itemsList: null,
            suppliersList: [],
            currentOrder: null,
            currentSupplier: null,
            currentProduct: null,
            currentItem: null,
            currentQty: 1,
            showOptions: false,
            showItemOption: false,
            queryProducts: "",
            querySuppliers: "",
            queryItems: "",
            error: null
        };
    }


    /**
     * Before component is rendered get user using token,
     * get its suppliers and products
     * and also get full info from them
     */
    public componentWillMount() {
        (async () => {
            const token = getAuthToken();
            if (token) {
                this.setState({ token: token });
                const user = await getUser(token) as UserItem;
                const id = this.props.match.params.id;
                if (user) {
                    this.setState({ user: user });
                    this.setState({ Suppliers: user.suppliers });
                    this.setState({ Products: user.products });
                }
                /**
                 * If there is params, set current order state,
                 * use it to set the item list for edition and
                 * remove items from products list
                 */
                if (id) {
                    const response2 = await fetch(`/api/v1/orders/${id}/products`);
                    const data2 = await response2.json() as ProductsItem[];
                    const response3 = await fetch(`/api/v1/orders/${id}`);
                    const data3 = await response3.json() as OrdersItem;
                    if (data2 && data3) {
                        this._updateLists(data2);
                        this.setState({ order: data3 });
                    }
                } else {
                    const order = await createOrder(Date(), token) as OrdersItem;
                    this.setState({ order: order });
                }
            }
        })();
    }

    /**
     * Render main component
     */
    public render() {
        if (this.state.Products === null) {
            return <h1>Loading...</h1>;
        } else {
            return [<h1>
                New Order
                </h1>,
            <div>
                {this._showProductSearchBox()}

            </div>,
            <div>
                {this._showSelectProductMsg()}
                {this._productOption()}
                {this._showGenerateButton()}
            </div>,
            <div>
                {this._showItemSearchBox()}
            </div>
            ]
        }
    }

    /**
     * Show step 1
     */
    private _showSelectProductMsg() {
        if (this.state.currentProduct || this.state.itemsList) {
            return <div className="select_prod_msg_left">
                <h3>Step 1:</h3>
                <h4>Select a Product</h4>
            </div>
        } else {
            return <div className="select_prod_msg_middle">
                <h3>Step 1:</h3>
                <h4>Select a Product</h4>
            </div>
        }

    }

    /**
     * Show step 2
     */
    private _showSelectQtyMsg() {
        if (this.state.currentProduct) {
            return <div className="select_qty_msg">
                <h3>Step 2: <label className="step_msg"> Select Quantity</label></h3>
            </div>
        }
    }

    /**
     * Show step 3
     */
    private _showGenOrderMsg() {
        if (this.state.itemsList) {
            return <div className="select_qty_msg">
                <h3>Step 3: <label className="step_msg"> Create Order</label></h3>
            </div>
        }
    }
    /**
     * Show Products search box
     */
    private _showProductSearchBox() {
        if (this.state.Products && (this.state.currentProduct || this.state.itemsList)) {
            const filteredProducts = this.state.Products.filter((product) => {
                return (product.name.toLocaleLowerCase().indexOf(this.state.queryProducts) || product.supplier.companyName.toLocaleLowerCase().indexOf(this.state.querySuppliers)) !== -1;
            });
            return <div>
                <div>
                    <input
                        className="newOrder_left_search"
                        placeholder="Search by Name"
                        type="text"
                        onKeyUp={(e) => this._onProductSearch(e.currentTarget.value)}
                    />
                    <input
                        className="newOrder_search_middle"
                        placeholder="Search by Supplier"
                        type="text"
                        onKeyUp={(e) => this._onSupplierSearch(e.currentTarget.value)}
                    />
                    {this._showProductsList(filteredProducts)/** Show filtered list*/}
                </div>
            </div>
        } else if (this.state.Products) {
            const filteredProducts = this.state.Products.filter((product) => {
                return (product.name.toLocaleLowerCase().indexOf(this.state.queryProducts) || product.supplier.companyName.toLocaleLowerCase().indexOf(this.state.querySuppliers)) !== -1;
            });
            return <div>
                <div>
                    <input
                        className="search_box_middle_big"
                        placeholder="Search by Name"
                        type="text"
                        onKeyUp={(e) => this._onProductSearch(e.currentTarget.value)}
                    />
                    <input
                        className="search_box_right_big"
                        placeholder="Search by Supplier"
                        type="text"
                        onKeyUp={(e) => this._onSupplierSearch(e.currentTarget.value)}
                    />
                    {this._showProductsList(filteredProducts)}
                </div>
            </div>
        }
    }

    /**
     * Update product search query
     */
    private _onProductSearch(query: string) {
        this.setState({ queryProducts: query.toLocaleLowerCase() });
    }

    /**
     * Update supplier search query
     */
    private _onSupplierSearch(query: string) {
        this.setState({ querySuppliers: query.toLocaleLowerCase() });
    }

    // Update the state (currentQty) on keyup
    private _updateQty(qty: number) {
        this.setState({ currentQty: qty });
    }

    /**
     * Show Suppliers search box
     */
    private _showItemSearchBox() {
        if (this.state.itemsList && this.state.itemsList.length > 0) {
            const filteredItems = this.state.itemsList.filter((product) => {
                return product.name.toLocaleLowerCase().indexOf(this.state.queryItems) !== -1;
            });
            return <div>
                <input
                    className="newOrder_search_item"
                    placeholder="Search by Name"
                    type="text"
                    onKeyUp={(e) => this._onItemSearch(e.currentTarget.value)}
                /><img className="image_icon_small" src={Cart} alt="edit"></img>
                {this._showItemsList(filteredItems)}
            </div>
        }
    }

    private _onItemSearch(query: string) {
        this.setState({ queryItems: query.toLocaleLowerCase() });
    }


    /**
     * Select Product
     */
    private _selectProduct(product: ProductsItem) {
        this.setState({ currentProduct: product });
        this.setState({ currentItem: null });
        this._showOptions(true);
        this.setState({ currentQty: 1 });
    }

    /**
     * set show options state
     */
    private _showOptions(bool: boolean) {
        this.setState({ showOptions: bool });
    }


    /**
     * Show options for selected product
     */
    private _productOption() {
        if (this.state.currentProduct && this.state.showOptions == true) {
            const product = this.state.currentProduct;
            return <div className="qty-container">
                <div className="qty_input">
                    <div className="display_buttons"><button className="header_button">Product</button><button className="header_button_small">qty</button></div>
                    <div className="display_buttons"><button className="item_button">{this.state.currentProduct.name}</button>
                        <input
                            className="input_small"
                            onInput={(e) => this._updateQty((e as any).target.value)}
                            type="number"
                            placeholder="1"
                            name="quantity"
                            min="1"></input>
                        <button className="header_button_small_input" onClick={() => this._addToList(product)}>add</button>
                    </div>
                </div>
                {this._showSelectQtyMsg()}
            </div>
        }
    }

    /**
     * Show options for selected product
     */
    private _showGenerateButton() {
        if (this.state.itemsList) {
            return <div className="generate-container">
                {this._showGenOrderMsg()}
                <button onClick={() => this._handleCreateOrder()} className="big_submit_button">
                    Generate Order
            </button>
            </div>
        }
    }
    /**
     * Show products list if there are products in the state
     * change position of the list if there isnt an item's list
     */
    private _showProductsList(list: ProductsItem[]) {
        if (this.state.currentProduct || this.state.itemsList) {
            return [<div className="less_left_list_neworder">
                <div className="display_buttons">
                    <button className="header_button">Products</button>
                    <button className="header_button">Unit</button>
                    <button className="header_button">Supplier</button>
                </div>
                {list.map((product, index) => {
                    return <div className="display_buttons" onClick={() => this._selectProduct(product)} key={index}>
                        <button className="item_button" >{product.name}</button>
                        <button className="item_button">{product.unit}</button>
                        <button className="item_button">{product.supplier.companyName}</button>
                    </div>
                })}
            </div>]
        } else {
            return [<div className="lower_center_list_neworder">
                <div className="display_buttons">
                    <button className="header_button">Products</button>
                    <button className="header_button">Unit</button>
                    <button className="header_button">Supplier</button>
                </div>
                {list.map((product, index) => {
                    return <div className="display_buttons" onClick={() => this._selectProduct(product)} key={index}>
                        <button className="item_button" >{product.name}</button>
                        <button className="item_button">{product.unit}</button>
                        <button className="item_button">{product.supplier.companyName}</button>
                    </div>
                })}
            </div>]
        }
    }

    /**
     * Update the state (Items List) on keyup
     * Removes items from current products list if selected
     */
    private _addToList(item: ProductsItem) {
        //list of items to be ordered
        let currentItemsList: ProductsItem[] = [];
        //list of products in the server
        let currentProductsList: ProductsItem[] = [];
        //list of suppliers to be ordered from
        let currentSuppliersList: SuppliersItem[] = [];
        /**
         * if lists are populated
         */
        if (this.state.itemsList && this.state.itemsList.length > 0 &&
            this.state.Products && this.state.currentQty) {
            //create arrays in order to modify them
            currentItemsList = this.state.itemsList;
            currentProductsList = this.state.Products;
            //if order's suppliers list is empty leave it empty or assign current value
            if (this.state.suppliersList) {
                currentSuppliersList = this.state.suppliersList;
            } else {
                currentSuppliersList = [];
            }

            //Assign current quantity to product
            item.qty = this.state.currentQty;
            //modify the arrays
            currentItemsList.push(item);
            const supplier = item.supplier;
            //Add supplier to list if current list doesnt include this items supplier
            let index1 = currentSuppliersList.findIndex(x => x.id == supplier.id)
            // here you can check specific property for an object whether it exist in your array or not
            if (index1 === -1) {
                currentSuppliersList.push(supplier);
                this._handleAddSupplier(supplier);
            }

            const index = currentProductsList.indexOf(item, 0);
            if (index > -1) {
                currentProductsList.splice(index, 1);
            }
            //update the lists
            this.setState({ itemsList: currentItemsList });
            this.setState({ Products: currentProductsList });
            this.setState({ suppliersList: currentSuppliersList });
            this._showOptions(false);
            this._handleAddProduct(item);
            /**
             * if items list is not populated
             */
        } else if (this.state.Products && this.state.currentQty) {
            item.qty = this.state.currentQty;
            currentItemsList.push(item);
            this.setState({ itemsList: currentItemsList });
            currentProductsList = this.state.Products;
            //if order's suppliers list is empty leave it empty or assign current value
            if (this.state.suppliersList) {
                currentSuppliersList = this.state.suppliersList;
            } else {
                currentSuppliersList = [];
            }
            const supplier = item.supplier;
            let index1 = currentSuppliersList.findIndex(x => x.id == supplier.id)
            // here you can check specific property for an object whether it exist in your array or not
            if (index1 === -1) {
                currentSuppliersList.push(supplier);
                this._handleAddSupplier(supplier);
            }
            const index = currentProductsList.indexOf(item, 0);
            if (index > -1) {
                currentProductsList.splice(index, 1);
            }
            this._handleAddProduct(item);
            this.setState({ Products: currentProductsList });
            this.setState({ suppliersList: currentSuppliersList });
            this._showOptions(false);
        }
    }

    // Send HTTP request (add product to order)on click
    private _handleAddProduct(item: ProductsItem) {
        (async () => {
            try {
                if (this.state.token && this.state.order) {
                    // Reset error
                    this.setState({ error: null });
                    const products = await addProduct(this.state.order.id, item, this.state.token);
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    // Send HTTP request (add product to order)on click
    private _handleAddSupplier(supplier: SuppliersItem) {
        (async () => {
            try {
                if (this.state.token && this.state.order) {
                    // Reset error
                    this.setState({ error: null });
                    const suppliers = await addSupplier(this.state.order.id, supplier.id, this.state.token);
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    /**
     * Update the lists with the one that comes from params
     */
    private _updateLists(items: ProductsItem[]) {
        //update items list
        this.setState({ itemsList: items })
        //update products/suppliers list
        let currentProductsList: ProductsItem[] = [];
        let currentSuppliersList: SuppliersItem[] = [];
        if (this.state.Products) {
            currentProductsList = this.state.Products;
            for (let item of items) {
                const index = currentProductsList.findIndex(x => x.id == item.id);
                if (index > -1) {
                    currentProductsList.splice(index, 1);
                }
                //check if suppliers is in the order already
                const supplier = item.supplier;
                let index1 = currentSuppliersList.findIndex(x => x.id == supplier.id)
                if (index1 === -1) {
                    currentSuppliersList.push(supplier);
                }
            }
            this.setState({ suppliersList: currentSuppliersList });
            this.setState({ Products: currentProductsList });
        }
    }

    /**
     * Update the state (Items List) on keyup
     * Removes items from current products list if selected
     */
    private _removeFromList(item: ProductsItem) {
        //list of items to be ordered
        let currentItemsList: ProductsItem[] = [];
        //list of products in the server
        let currentProductsList: ProductsItem[] = [];
        //list of suppliers to be ordered from
        let currentSuppliersList: SuppliersItem[] = [];
        /**
         * if lists are populated
         */
        if (this.state.itemsList && this.state.itemsList.length > 0 && this.state.Products) {
            //create arrays in order to modify them
            currentItemsList = this.state.itemsList;
            currentProductsList = this.state.Products;
            //modify the arrays
            currentProductsList.push(item);
            const index = currentItemsList.indexOf(item, 0);
            if (index > -1) {
                currentItemsList.splice(index, 1);
            }
            //if order's suppliers list is empty leave it empty or assign current value
            if (this.state.suppliersList) {
                currentSuppliersList = this.state.suppliersList;
                const supplier = item.supplier;
                let found: boolean = false;
                for (let product of currentItemsList) {
                    if (product.supplier.id == supplier.id) {
                        found = true;
                    }
                }
                if (found == false) {
                    const index = currentSuppliersList.indexOf(supplier, 0);
                    if (index > -1) {
                        currentSuppliersList.splice(index, 1);
                        this._handleRemoveSupplier(supplier);
                    }
                }
            }
            //update the lists
            this.setState({ itemsList: currentItemsList });
            this.setState({ Products: currentProductsList });
            this.setState({ suppliersList: currentSuppliersList });
            this._handleRemoveProduct(item);
        }
    }

    // Send HTTP request (add product to order)on click
    private _handleRemoveProduct(item: ProductsItem) {
        (async () => {
            try {
                if (this.state.token && this.state.order) {
                    // Reset error
                    this.setState({ error: null });
                    const products = await removeProduct(this.state.order.id, item, this.state.token);
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    // Send HTTP request (add product to order)on click
    private _handleRemoveSupplier(supplier: SuppliersItem) {
        (async () => {
            try {
                if (this.state.token && this.state.order) {
                    // Reset error
                    this.setState({ error: null });
                    const suppliers = await removeSupplier(this.state.order.id, supplier.id, this.state.token);
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    /**
     * Select Item
     */
    private _selectItem(product: ProductsItem) {
        if (this.state.currentItem) {
            this.setState({ currentItem: null });
        } else {
            this.setState({ currentItem: product });
            this._showItemOption(true);
        }
    }

    /**
     * set show item options state
     */
    private _showItemOption(bool: boolean) {
        this.setState({ showItemOption: bool });
    }

    /**
     * Show item qty option
     */
    private _itemOption(product: ProductsItem) {
        if (this.state.showItemOption && this.state.currentItem && product.id == this.state.currentItem.id) {
            const item = this.state.currentItem;
            return [<input
                className="input_small"
                onInput={(e) => this._updateQty((e as any).target.value)}
                type="number"
                placeholder="1"
                name="quantity"
                min="1"></input>,
            <button onClick={() => this._updateItems(item)} className="item_button_small_input">+</button>]
        } else {
            return <button onClick={() => this._selectItem(product)} className="item_button_small_input">{product.qty}</button>
        }
    }

    private _updateItems(item: ProductsItem) {
        if (this.state.itemsList && this.state.currentItem && this.state.currentQty) {

            // Remove item from list in database
            this._handleRemoveProduct(item)
            // Get current list of items   
            let currentItems = this.state.itemsList;
            let index = currentItems.findIndex(x => x.id == item.id)
            // Remove item from current list
            if (index > -1) {
                currentItems.splice(index, 1);
            }
            // Assign current quantity to product
            item.qty = this.state.currentQty;
            // Add modified item to list
            currentItems.unshift(item);
            //Update current items list
            this.setState({ itemsList: currentItems });
            //Update database
            this._handleAddProduct(item);
            //Close option window
            this._showItemOption(false);

        }
    }

    /**
     * Show current products list
     */
    private _showItemsList(list: ProductsItem[]) {
        return [
            <div className="order_items_list">
                <button className="header_button_small">del</button>
                <button className="no_header_button_big">Items to Order</button>
                <button className="header_button_small">Qty</button>
                {list.map((product, index) => {
                    return <div key={index}>
                        <button onClick={() => this._removeFromList(product)} className="item_button_small_input">-</button>
                        <button className="no_item_button_big" >{product.name}</button>
                        {this._itemOption(product)}
                    </div>
                })}
            </div>];
    }

    /**
     * Send HTTP request (add product and supplier to order)on click
     */
    private _handleCreateOrder() {
        (async () => {
            try {
                //if user is logged in and there is a item list set
                if (this.state.token && this.state.itemsList && this.state.suppliersList) {
                    // Reset error
                    this.setState({ error: null });

                    //add each product and supplier to the order
                    if (this.state.order) {

                        const order = await updateOrder(this.state.order.id, this.state.token);
                        //go to the confirm order's page 
                        /**
                         * (go to '/' 1st otherwise it redirects to neworder/confirmorder/orderId 
                         * if there is params)
                         */
                        this.props.history.push(`/`);
                        this.props.history.push(`confirmorder/${this.state.order.id}`);
                        //this._updateMessageStatus();
                    }

                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

}

export const NewOrder = withRouter(props => <NewOrderInternal {...props} />);

/**
 * Get user info using token
 */
async function getUser(jwt: string) {
    return new Promise(function (resolve, reject) {
        (async () => {

            const response = await fetch(
                "/api/v1/auth/profile",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-auth-token": jwt
                    }
                }
            );
            const json = await response.json();
            if (response.status === 200) {
                resolve(json);
            } else {
                reject(json);
            }
        })();
    });
}

/**
 * Add Order to database
 * 
 * @param date 
 * @param jwt 
 */
async function createOrder(date: string, jwt: string) {
    return new Promise(function (resolve, reject) {
        (async () => {
            const data = {
                date: date,
                confirmed: false,
                favourite: false
            };
            const response = await fetch(
                "/api/v1/orders",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-auth-token": jwt
                    },
                    body: JSON.stringify(data)
                }
            );
            const json = await response.json();
            if (response.status === 200) {
                resolve(json);
            } else {
                reject(json);
            }
        })();
    });
}

/**
 * Add product to order
 */
async function addProduct(id: number, product: ProductsItem, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {

            const newOrderProduct = {
                qty: product.qty
            };

            const response = await fetch(
                `/api/v1/orders/${id}/add/${product.id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-auth-token": jwt
                    },
                    body: JSON.stringify(newOrderProduct)
                }
            );
            const json = await response.json();
            if (response.status === 200) {
                resolve(json);
            } else {
                reject(json);
            }
        })();
    });
}

/**
 * Add supplier to order
 */
async function addSupplier(id: number, supplierId: number, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {

            const newOrderSupplier = {
                emailSent: "none"
            };

            const response = await fetch(
                `/api/v1/orders/${id}/addsup/${supplierId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-auth-token": jwt
                    },
                    body: JSON.stringify(newOrderSupplier)
                }
            );
            const json = await response.json();
            if (response.status === 200) {
                resolve(json);
            } else {
                reject(json);
            }
        })();
    });
}

/**
 * Add product to order
 */
async function removeProduct(id: number, product: ProductsItem, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {

            const newOrderProduct = {
                qty: product.qty
            };

            const response = await fetch(
                `/api/v1/orders/${id}/remove/${product.id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-auth-token": jwt
                    },
                    body: JSON.stringify(newOrderProduct)
                }
            );
            const json = await response.json();
            if (response.status === 200) {
                resolve(json);
            } else {
                reject(json);
            }
        })();
    });
}

/**
 * Add supplier to order
 */
async function removeSupplier(id: number, supplierId: number, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {

            const newOrderSupplier = {
                emailSent: "none"
            };

            const response = await fetch(
                `/api/v1/orders/${id}/removesup/${supplierId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-auth-token": jwt
                    },
                    body: JSON.stringify(newOrderSupplier)
                }
            );
            const json = await response.json();
            if (response.status === 200) {
                resolve(json);
            } else {
                reject(json);
            }
        })();
    });
}

/**
 * Patch order to make it favourite
 * 
 * @param id 
 * @param name 
 * @param jwt 
 */
async function updateOrder(id: number, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const update = {
                date: Date()
            };
            const response = await fetch(
                `/api/v1/orders/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "x-auth-token": jwt
                    },
                    body: JSON.stringify(update)
                }
            );
            const json = await response.json();
            if (response.status === 200) {
                resolve(json);
            } else {
                reject(json);
            }
        })();
    });
}