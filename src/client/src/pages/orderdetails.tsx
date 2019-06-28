import * as React from "react";
import { withRouter, match } from "react-router";
import { getAuthToken } from "../components/with_auth/with_auth"
import Edit from './images/edit.png';
import Send from './images/send.png';
import { Dialog } from "../components/dialog/dialog";
import * as H from 'history';


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

interface OrderDetailsProps {
    history: H.History;
    match: match<{ id: string }>
}

interface OrderDetailsState {
    user: UserItem | null;
    Order: OrdersItem | null;
    productsSelected: boolean | null;
    suppliersSelected: boolean | null;
    currentSupplier: SuppliersItem | null;
    sendOrder: boolean | null;
    editOrder: boolean | null;
}

export class OrderDetailsInternal extends React.Component<OrderDetailsProps, OrderDetailsState> {
    public constructor(props: OrderDetailsProps) {
        super(props);
        this.state = {
            user: null,
            Order: null,
            productsSelected: null,
            suppliersSelected: null,
            currentSupplier: null,
            sendOrder: false,
            editOrder: false,
        };
    }

    /**
     * Get order id from params and set states
     */
    public componentWillMount() {
        (async () => {
            const id = this.props.match.params.id;
            const orderIdNbr = parseInt(id);
            const order = await getData(orderIdNbr) as unknown as OrdersItem;
            this.setState({ Order: order });
            /**
             * Get info from user
             */
            const token = getAuthToken();
            if (token) {
                const user = await getUser(token) as UserItem;
                this.setState({ user: user });
            }
        })();
    }

    /**
     * Show Page content if order and user found
     */
    public render() {
        if (this.state.Order === null || this.state.user == null) {
            return <h1>Loading...</h1>;
        } else {
            return <div><h1>
                Order Details
            </h1>
                {this._showOrder()}
                {this._showProducts()}
                {this._showSuppliers()}
                {this._showSendOrder()}
                {this._showEditOrder()}
                {this._showOptions()}
            </div>
        }
    }

    /**
     * Show order layout depending on selection
     */
    private _showOrder() {
        if (this.state.Order && (this.state.productsSelected || this.state.suppliersSelected)) {
            return <div className="order_details_left">
                <div><button className="header_button">Date</button>
                    <button className="header_button">Status</button>
                    <button className="header_button">Favourite</button></div>
                <div><button className="no_item_button">{this._showDate(this.state.Order.date)}</button>
                    <button className="no_item_button">{this._showOrderStatus(this.state.Order.confirmed)}</button>
                    <button className="no_item_button">{this._showIfFavourites(this.state.Order.favourite)}</button></div>
                <button onClick={() => this._selectProducts(true)} className="button_big_big">Products List</button >
                <button onClick={() => this._selectSuppliers(true)} className="button_big_big">Suppliers List</button>
            </div>
        } else if (this.state.Order) {
            return <div className="order_details">
                <div><button className="header_button">Date</button>
                    <button className="header_button">Status</button>
                    <button className="header_button">Favourite</button></div>
                <div><button className="no_item_button">{this._showDate(this.state.Order.date)}</button>
                    <button className="no_item_button">{this._showOrderStatus(this.state.Order.confirmed)}</button>
                    <button className="no_item_button">{this._showIfFavourites(this.state.Order.favourite)}</button></div>
                <button onClick={() => this._selectProducts(true)} className="button_big_big">Products List</button >
                <button onClick={() => this._selectSuppliers(true)} className="button_big_big">Suppliers List</button>
            </div>
        }
    }
    
    /**
     * Show order options
     */
    private _showOptions(){
        if (this.state.Order && (this.state.productsSelected || this.state.suppliersSelected)) {
            return <div className="details_options_left">
                <div onClick={() => this._selectEditOrder(true)} ><img className="image_icon" src={Edit} alt="edit"></img></div>
                <div onClick={() => this._selectSendOrder(true)} ><img className="image_icon" src={Send} alt="send"></img></div>
            </div>
        } else if (this.state.Order) {
            return <div className="details_options_middle">
                <div onClick={() => this._selectEditOrder(true)} ><img className="image_icon" src={Edit} alt="edit"></img></div>
                <div onClick={() => this._selectSendOrder(true)} ><img className="image_icon" src={Send} alt="send"></img></div>
            </div>
        }
    }

    /**
     * Select Product option, deselect the rest
     */
    private _selectProducts(bool: boolean) {
        if (this.state.productsSelected == true) {
            this.setState({ productsSelected: false })
            this.setState({ currentSupplier: null })
        } else {
            this.setState({ suppliersSelected: false })
            this.setState({ productsSelected: bool })
            this.setState({ currentSupplier: null })
        }
    }

    /**
     * Select Supplier option, deselect the rest
     */
    private _selectSuppliers(bool: boolean) {
        if (this.state.suppliersSelected == true) {
            this.setState({ suppliersSelected: false })
            this.setState({ currentSupplier: null })
        } else {
            this.setState({ currentSupplier: null })
            this.setState({ productsSelected: false })
            this.setState({ suppliersSelected: bool })
        }
    }
    
    /**
     * Show Order Suppliers
     */
    private _showSuppliers() {
        if (this.state.Order && this.state.suppliersSelected == true && this.state.currentSupplier) {
            return <div className="details_suppliers">
                <div>
                    <button className="header_button">{this.state.currentSupplier.companyName}</button>
                    <button onClick={() => this.setState({ currentSupplier: null })} className="item_button">Go back</button>
                </div>
                {this._showEmail()}
            </div>
        } else if (this.state.Order && this.state.suppliersSelected == true) {
            return <div className="details_suppliers">
                {this.state.Order.suppliers.map((supplier, index) => {
                    return <div>
                        <div>
                            <button className="no_item_button">{supplier.companyName}</button>
                            <button onClick={() => this._selectSupplier(supplier)} className="header_button_big">Show Email</button></div>
                    </div>
                })}
            </div>;
        }
    }

    /**
     * Select Supplier, Deselect current supplier
     */
    private _selectSupplier(supplier: SuppliersItem) {
        if (this.state.currentSupplier) {
            this.setState({ currentSupplier: null })
        } else {
            this.setState({ currentSupplier: supplier })
        }
    }

    /**
     * Show supplier email
     */
    private _showEmail() {
        if (this.state.currentSupplier) {
            return <textarea value={this.state.currentSupplier.emailSent} className="email_box_free" >
            </textarea>
        }
    }

    /**
     * Show order products
     */
    private _showProducts() {
        if (this.state.Order && this.state.productsSelected == true) {
            return <div className="details_suppliers">
                <div className="display_buttons"><button className="header_button">Name</button>
                    <button className="header_button">Unit</button>
                    <button className="header_button">Qty</button>
                    </div>
                {this.state.Order.products.map((product, index) => {
                    return <div>
                        <div className="display_buttons">
                            <button className="no_item_button">{product.name}</button>
                            <button className="no_item_button">{product.unit}</button>
                            <button className="no_item_button">{product.qty}</button>
                        </div>
                    </div>
                })}
            </div>;
        }
    }

    /**
     * Show yes pr no if order is favourite
     */
    private _showIfFavourites(favo: string) {
        if (favo != "false") {
            return "yes"
        } else {
            return "no"
        }
    }

    /**
     * Show order status depending on boolean
     */
    private _showOrderStatus(status: boolean) {
        if (status == true) {
            return "sent"
        } else {
            return "not sent"
        }
    }

    /**
     * Show date in a different format
     */
    private _showDate(date: string) {
        let newDate = new Date(date)
        let formatted_date = newDate.getDate() + "-" + (newDate.getMonth() + 1) + "-" + newDate.getFullYear()
        return formatted_date
    }

    /**
     *  Change remove Order state to true
     */
    private _selectEditOrder(bool: boolean) {
        this.setState({ editOrder: bool });
    }

    /**
     *  Change send Order state to true
     */
    private _selectSendOrder(bool: boolean) {
        this.setState({ sendOrder: bool });
    }

    /**
     * Show delete product dialog
     */
    private _showSendOrder() {
        if (this.state.sendOrder == true) {
            return <Dialog
                title={"Send Order"}
                body={<div className="dialog_content_message">
                    <div >
                        Proceed to order confirmation?
                        </div>
                </div>}
                cancel={<button className="item_button" onClick={() => this._selectSendOrder(false)}>No</button>}
                submit={<button className="item_button" onClick={() => this._sendOrder()}>Yes</button>}
            >
            </Dialog>
        } else {
            return
        }
    }

    /**
     * Proceed to order confirmation to send current favourite order
     */
    private _sendOrder() {
        if (this.state.Order && this.state.sendOrder == true) {
            //go to the confirm order's page
            this.props.history.push(`/`);
            this.props.history.push(`confirmorder/${this.state.Order.id}`);
        }
    }


    /**
     * Show delete product dialog
     */
    private _showEditOrder() {
        if (this.state.editOrder == true) {
            return <Dialog
                title={"Edit Order"}
                body={<div className="dialog_content_message">
                    <div >
                        Edit this order?
                        </div>
                </div>}
                cancel={<button className="item_button" onClick={() => this._selectEditOrder(false)}>No</button>}
                submit={<button className="item_button" onClick={() => this._handleEditOrder()}>Yes</button>}
            >
            </Dialog>
        } else {
            return
        }
    }

    /**
     * Proceed to neworder to edit current favourite order
     */
    private _handleEditOrder() {
        if (this.state.Order && this.state.editOrder == true) {
            //go to the new order's page
            this.props.history.push(`/`);
            this.props.history.push(`neworder/${this.state.Order.id}`);
        }
    }


}


export const OrderDetails = withRouter(props => <OrderDetailsInternal {...props} />)


/**
 * Get Suppliers with emails and products with quantities
 */
async function getData(orderId: number) {
    return new Promise(function (resolve, reject) {
        (async () => {
            const response = await fetch(
                `/api/v1/orders/${orderId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
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