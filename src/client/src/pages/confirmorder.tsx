import React from 'react';
import { withRouter, match } from "react-router-dom";
import * as H from 'history';
import { Dialog } from '../components/dialog/dialog';
import { getAuthToken } from '../components/with_auth/with_auth';
import { PopUp } from '../components/popup/popup';


/**
 * Style for delete email message 
 */
const deleteMessage: React.CSSProperties = {
    position: "absolute",
    background: "white",
    padding: "8px 25px",
    color: "black",
    height: "100px",
    width: "150px",
    top: "20px",
    left: "",
    fontSize: "15px",
    //border: "solid",
}

/**
 * Style for dialog form
 */
const formHolder: React.CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    fontFamily: `Rubik,Lato,"Lucida Grande","Lucida Sans Unicode",Tahoma,Sans-Serif`,
    fontSize: "10px"
};

interface ProductsItem {
    id: number;
    userId: number;
    SupplierId: number;
    name: string;
    type: string;
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
 * Interface for Orders
 */
interface OrderProductItem {
    user: UserItem;
    productId: number;
    orderId: number;
    products: ProductsItem[];
    orders: OrdersItem[];
    qty: number;
}

/**
 * Interface for Orders
 */
interface OrderSupplierItem {
    user: UserItem;
    supplierId: number;
    orderId: number;
    orders: OrdersItem[];
    suppliers: SuppliersItem[];
    emailSent: string;
}

/**
 * Interface for products
 */
interface ProductsItem {
    id: number;
    user: UserItem;
    supplier: SuppliersItem;
    name: string;
    unit: string;
    qty: number
    deleted: boolean;
}

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

interface ConfirmOrderPropsInternal {
    history: H.History;
    match: match<{ id: string }>
}

interface ConfirmOrderStateInternal {
    user: UserItem | null;
    orderId: number | null;
    Order: OrdersItem | null;
    OrderProducts: ProductsItem[] | null;
    OrderSuppliers: SuppliersItem[] | null;
    suppliersToEmail: SuppliersItem[] | null;
    currentSupplier: SuppliersItem | null;
    currentSuppliers: SuppliersItem[] | null;
    deleteEmail: boolean | null;
    cancelOrder: boolean | null;
    favouriteName: string | null;
    message: boolean | null;
    confirmOrderMessage: boolean | null;
    error: string | null;
}

export class ConfirmOrderInternal extends React.Component<ConfirmOrderPropsInternal, ConfirmOrderStateInternal> {
    public constructor(props: ConfirmOrderPropsInternal) {
        super(props);
        this.state = {
            user: null,
            orderId: null,
            Order: null,
            message: false,
            confirmOrderMessage: false,
            OrderProducts: null,
            OrderSuppliers: null,
            suppliersToEmail: null,
            currentSupplier: null,
            currentSuppliers: null,
            deleteEmail: false,
            cancelOrder: false,
            favouriteName: null,
            error: null
        };
    }

    public componentWillMount() {
        (async () => {
            /**
             * Get info from user
             */
            const token = getAuthToken();
            if (token) {
                const user = await getUser(token) as UserItem;
                this.setState({ user: user });
            }
            /**
             * Get order-suppliers and order-products of the order
             */
            const id = this.props.match.params.id;
            const orderIdNbr = parseInt(id);
            const Suppliers = await getData(orderIdNbr) as SuppliersItem[];
            this.setState({ suppliersToEmail: Suppliers });
            this.setState({ orderId: orderIdNbr })
            //empty array of suppliers that will be filled with updated suppliers
            let currentSuppliers: SuppliersItem[] = [];
            /**
             * Get full info from the suppliers and products and set states
             * for the confirm order page (Only if user is authorized)
             */
            if (this.state.suppliersToEmail && this.state.user) {
                for (let Supplier of this.state.suppliersToEmail) {
                    //Create empty string of email and product list for the email
                    let email: string = "";
                    let productsString: string = "";


                    Supplier.products.forEach(product => {
                        productsString = productsString + "\n" + product.name + " Qty: " + product.qty + " " + product.unit
                    });

                    /**
                     * Create string of the email for current supplier
                     */
                    email = "Dear " + Supplier.companyName + "\n" + "\n" + this.state.user.companyName + " would like to order the following items: \n" + productsString + "\n\nThis is an auto generated email. \nPlease contact us if there are any issues with the order. \nRegards \n\n" + this.state.user.contactName + "\n" + this.state.user.companyName + "\n" + this.state.user.email
                    /**
                     * Assign email to supplier
                     */
                    if (this.props.match.params.id && token) {
                        const emails = await assignEmailOrder(this.props.match.params.id, Supplier.id, email, token);
                    }
                    Supplier.emailSent = email;
                    /**
                     * Add updated supplier to current List
                     */
                    currentSuppliers.push(Supplier);

                }
                /**
                 * Assign updated supplier list to the component state 
                 */
                this.setState({ suppliersToEmail: currentSuppliers });
            }

        })();
    }

    public render() {
        /**
         * if state order null show loading...
         */
        if (this.state.suppliersToEmail === null || this.state.user == null) {
            return <h1>Generating Emails...</h1>;
        } else {
            return [
                <h1>
                    Order Confirmation
                    </h1>,
                <div className="options_confirm">
                    <button className="header_button_big" onClick={() => this._handleConfirmOrder()}>Confirm Order</button>
                    <button className="header_button_big" onClick={() => this._handleEditOrder()}>Edit Order</button>
                    <button className="header_button_big" onClick={() => this._selectCancelOrder(true)}>Cancel Order</button>
                    <input
                        type="text"
                        placeholder="Favorite"
                        onKeyUp={(e) => this._updateFavouriteName((e as any).target.value)}
                        className="email_input_box" >
                    </input>
                    <button className="email_item_button_small" onClick={() => this._makeFavourite()}  >Add</button>

                </div>,
                <div className="left_list_less_big"><div>
                    <div className="suppliers_list">
                        <button className="header_button">Suppliers</button>
                        {this.state.suppliersToEmail.map((Supplier, index) => {
                            return [
                                <div key={index}>
                                    <button className="item_button" onClick={() => this._selectSupplier(Supplier)}>{Supplier.companyName}</button>
                                </div>,
                                <div>
                                    {this._showEmailBox()}
                                    {this._showDeleteEmail()}
                                    {this._showFavouritedMessage()}
                                    {this._showCancelOrder()}
                                    {this._showOrderConfirmedMessage()}
                                </div>
                            ]
                        })}
                    </div>
                </div>
                    <button onClick={() => this._selectDeleteEmail()} className="delete_email_button" >Delete Email</button>
                </div>
            ]
        }
    }

    /**
     *  Send HTTP request (delete supplier)on click
     *  And also change the states so the component updates
     */
    private _handleEditOrder() {
        (async () => {
            try {
                const token = getAuthToken();
                if (token && this.state.orderId) {
                    // Reset error
                    this.setState({ error: null });
                    //Send Emails
                    this._handleSendEmails();
                    this._selectConfirmOrderPopup(true);
                    //go to the order details's page 
                    this.props.history.push(`/`);
                    this.props.history.push(`neworder/${this.state.orderId}`);
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    /**
     *  Send HTTP request (delete supplier)on click
     *  And also change the states so the component updates
     */
    private _handleConfirmOrder() {
        (async () => {
            try {
                const token = getAuthToken();
                if (token && this.state.orderId) {
                    // Reset error
                    this.setState({ error: null });
                    //Confirm order
                    const order = await confirmOrder(this.state.orderId, token);
                    //Send Emails
                    this._handleSendEmails();
                    this._selectConfirmOrderPopup(true);
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    /**
     * Send email to each supplier on the list
     */
    private _handleSendEmails() {
        (async () => {
            const token = getAuthToken();
            if (token && this.state.suppliersToEmail && this.state.user) {
                try {
                    this.state.suppliersToEmail.forEach(async supplier => {
                        const user = await sendEmail(supplier.email, "Order", supplier.emailSent, token);

                    });
                } catch (err) {
                    this.setState({ error: err.error });
                }
            }
        })();

    }

    /**
     * open or close popup message
     * @param bool 
     */
    private _selectConfirmOrderPopup(bool: boolean) {
        if (this.state.confirmOrderMessage) {
            this.setState({ confirmOrderMessage: null });
        } else {
            this.setState({ confirmOrderMessage: bool });
        }
    }

    /**
     * Show account deleted popup
     */
    private _showOrderConfirmedMessage() {
        if (this.state.confirmOrderMessage == true) {
            return <PopUp
                title={"Order Confirmed"}
                message={"Emails have been sent"}
                close={<div onClick={() => this._goToDetails()}>close</div>}
            ></PopUp>
        }
    }

    /**
     * Go to order confirmation
     */
    private _goToDetails() {
        if (this.state.orderId) {
            //go to the order details's page 
            this.props.history.push(`/`);
            this.props.history.push(`orderdetails/${this.state.orderId}`);
        }
    }


    /**
     *  Update the state (favoriteName) on keyup
     *
     */
    private _updateFavouriteName(name: string) {
        this.setState({ favouriteName: name });
    }

    /**
     * Make Order a favourite
     */
    private _makeFavourite() {
        (async () => {
            try {
                const token = getAuthToken();
                //if user is logged in and there is a item list set
                if (token && this.state.favouriteName && this.state.orderId) {
                    //update message
                    this._updateFavouriteMsgStatus();
                    // Reset error
                    this.setState({ error: null });
                    const order = await favouriteOrder(this.state.orderId, this.state.favouriteName, token);

                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    /**
     *  Change current supplier to the one selected
     */
    private _selectSupplier(supplier: SuppliersItem) {
        if (this.state.currentSupplier) {
            this.setState({ currentSupplier: null });
        } else {
            this.setState({ currentSupplier: supplier });
        }
    }

    /**
     *  Change state of cancel order
     */
    private _selectCancelOrder(bool: boolean) {
        this.setState({ cancelOrder: bool });
    }


    /**
     * Show delete email dialog
     */
    private _showCancelOrder() {
        if (this.state.cancelOrder == true) {
            return <Dialog
                title={"Cancel"}
                body={<div style={formHolder}>
                    <div style={deleteMessage}>
                        Are you sure you want to cancel de order?
                    </div>
                </div>}
                cancel={<button className="item_button" onClick={() => this._selectCancelOrder(false)}>No</button>}
                submit={<button className="item_button" onClick={() => this._handleCancelOrder()}>Yes</button>}
            >
            </Dialog>
        } else {
            return
        }
    }

    /**
     *  Send HTTP request (delete supplier)on click
     *  And also change the states so the component updates
     */
    private _handleCancelOrder() {
        this.props.history.push("/");
    }

    /**
     * Show email box list
     */
    private _showEmailBox() {
        if (this.state.currentSupplier) {
            return <div className="email_box_container">
                <div><button className="email_header">{this.state.currentSupplier.companyName}</button></div>
                <textarea value={this.state.currentSupplier.emailSent} className="email_box" >
                </textarea>
            </div>
        } else if (this.state.currentSupplier == null) {
            return <div></div>
        }
    }

    // Update the state (ProductType) on keyup
    private _updateFavouriteMsgStatus() {
        this.setState({ message: true });
    }

    /**
     *  Change state of delete email 
     */
    private _selectDeleteEmail() {
        this.setState({ deleteEmail: true });
    }

    /**
     * Show delete email dialog
     */
    private _showDeleteEmail() {
        if (this.state.deleteEmail == true) {
            return <Dialog
                title={"Delete Email"}
                body={<div style={formHolder}>
                    <div style={deleteMessage}>
                        Are you sure you want to delete the email for this suppier?
                        (Items will be deleted from the order as well)
                    </div>
                </div>}
                cancel={<button className="item_button" onClick={() => this._cancelDeleteSupplier()}>Cancel</button>}
                submit={<button className="item_button" onClick={() => this._handleDeleteSupplier()}>Delete</button>}
            >
            </Dialog>
        } else {
            return
        }
    }

    /**
     *  Change open state of deleting supplier
     */
    private _cancelDeleteSupplier() {
        this.setState({ deleteEmail: false });
    }

    /**
     *  Send HTTP request (delete supplier)on click
     *  And also change the states so the component updates
     */
    private _handleDeleteSupplier() {
        (async () => {
            try {
                const token = getAuthToken();
                if (token && this.state.orderId && this.state.suppliersToEmail && this.state.currentSupplier) {
                    let currentSuppliers = this.state.suppliersToEmail;
                    const index = currentSuppliers.indexOf(this.state.currentSupplier, 0);
                    if (index > -1) {
                        currentSuppliers.splice(index, 1);
                    }
                    this.setState({ suppliersToEmail: currentSuppliers });
                    this._cancelDeleteSupplier();
                    // Reset error
                    this.setState({ error: null });
                    //Delete supplier from order in database
                    const supplier = await deleteSupplier(this.state.orderId, this.state.currentSupplier.id, token);
                    //Delete products from order in database
                    const products = await deleteProducts(this.state.orderId, this.state.currentSupplier.id, token);
                    //close the delete supplier window
                    this._cancelDeleteSupplier();
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    /**
     * Show product added popup
     */
    private _showFavouritedMessage() {
        if (this.state.message == true) {
            return <PopUp
                title={"Order"}
                message={"Order added to Favourites"}
                close={<div onClick={() => this._openPopup(false)}>close</div>}
            ></PopUp>
        }
    }

    /**
     * open or close popup message
     * @param bool 
     */
    private _openPopup(bool: boolean) {
        if (this.state.message) {
            this.setState({ message: null });
        } else {
            this.setState({ message: bool });
        }
    }


}

export const ConfirmOrder = withRouter(props => <ConfirmOrderInternal {...props} />);

/**
 * Get Suppliers with emails and products with quantities
 */
async function getData(orderId: number) {
    return new Promise(function (resolve, reject) {
        (async () => {
            const response = await fetch(
                `/api/v1/orders/${orderId}/suppliers`,
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
 * Get user info using id
 */
async function sendEmail(email: string, subject: string, text: string, jwt: string) {
    return new Promise(function (resolve, reject) {
        (async () => {

            const newEmail = {
                from: '',
                to: email,
                subject: subject,
                text: text
            }
            const response = await fetch(
                `/api/v1/users/sendemail`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-auth-token": jwt
                    },
                    body: JSON.stringify(newEmail)
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

/**
 * Delete supplier order
 * 
 * @param id 
 * @param jwt 
 */
async function deleteSupplier(id: number, supplierId: number, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const response = await fetch(
                `/api/v1/orders/${id}/removesup/${supplierId}`,
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
 * Delete supplier's products from order
 * 
 * @param id 
 * @param jwt 
 */
async function deleteProducts(id: number, supplierId: number, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const response = await fetch(
                `/api/v1/orders/${id}/removeproducts/${supplierId}`,
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
 * Patch order to make it favourite
 * 
 * @param id 
 * @param name 
 * @param jwt 
 */
async function favouriteOrder(id: number, name: string, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const update = {
                favourite: name
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

/**
 * Patch order to make it confirmed
 * 
 * @param id 
 * @param jwt 
 */
async function confirmOrder(id: number, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const update = {
                confirmed: true
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

/**
 * Patch order to assign email to supplier
 * 
 * @param id 
 * @param jwt 
 */
async function assignEmailOrder(id: string, sid: number, email: string, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const update = {
                emailSent: email
            };
            const response = await fetch(
                `/api/v1/ordersupplier/${id}/${sid}`,
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

