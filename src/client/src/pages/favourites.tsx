import React from 'react';
import { Listview } from '../components/listview/listview';
import { Link } from 'react-router-dom';
import Plus from './images/plus.png';
import { getAuthToken } from '../components/with_auth/with_auth';
import * as H from 'history';
import Delete from './images/delete.png';
import Edit from './images/edit.png';
import Send from './images/send.png';
import { Dialog } from '../components/dialog/dialog';
import { PopUp } from '../components/popup/popup';



/**
 * Dialog message holder
 */
const dialogMessage: React.CSSProperties = {
    position: "absolute",
    background: "white",
    padding: "8px 25px",
    color: "black",
    height: "100px",
    width: "150px",
    top: "20px",
    left: "",
    fontSize: "20px",
    //border: "solid",
}

/**
 * Dialog form holder
 */
const formHolder: React.CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    fontFamily: `Rubik,Lato,"Lucida Grande","Lucida Sans Unicode",Tahoma,Sans-Serif`,
    fontSize: "10px"
};

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

/**
 * Props for the page
 */
interface FavouritesProps {
    history: H.History;
}

/**
 * State for the page
 */
interface FavouritesState {
    user: UserItem | null;
    Orders: OrdersItem[] | null;
    Suppliers: SuppliersItem[] | null;
    Products: ProductsItem[] | null;
    itemsList: ProductsItem[] | null;
    currentOrder: OrdersItem | null;
    currentSupplier: SuppliersItem | null;
    currentProduct: ProductsItem | null;
    removeOrder: boolean | null;
    sendOrder: boolean | null;
    editOrder: boolean | null;
    queryOrders: string;
    queryDate: string;
    message: boolean | null;
    title: string | null;
    messageContent: string | null;
    error: string | null;
}

/**
 * Class constructor
 */
export class Favourites extends React.Component<FavouritesProps, FavouritesState> {
    public constructor(props: FavouritesProps) {
        super(props);
        this.state = {
            user: null,
            Orders: null,
            Suppliers: null,
            Products: null,
            itemsList: null,
            currentOrder: null,
            currentSupplier: null,
            currentProduct: null,
            removeOrder: false,
            sendOrder: false,
            editOrder: false,
            queryOrders: "",
            queryDate: "",
            message: false,
            title: "",
            messageContent: "",
            error: null
        };
    }


    /**
     * Before component is rendered get suppliers and products
     * for database and set the order state
     */
    public componentWillMount() {
        (async () => {
            const token = getAuthToken();
            if (token) {
                const user = await getUser(token) as UserItem;
                this.setState({ user: user });
                const favourites = await getFavourites(user.id) as OrdersItem[];
                this.setState({ Orders: favourites });

            }
        })();
    }

    /**
     * Render main component
     */
    public render() {
        if (this.state.Orders === null) {
            return <h1>Loading...</h1>;
        } else {
            return [<h1 >
                Favourites
                </h1>,
            <div>
                {this._showSearchBox()}
                {this._showRemoveOrder()}
                {this._showOrderOptions()}
                {this._showSendOrder()}
                {this._showEditOrder()}
                {this._showMessage()}
            </div>
            ]
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

    private _setMessage(title: string, message: string) {
        this.setState({ title: title });
        this.setState({ messageContent: message });
    }

    /**
     * Show message popup
     */
    private _showMessage() {
        if (this.state.message == true && this.state.title && this.state.messageContent) {
            return <PopUp
                title={this.state.title}
                message={this.state.messageContent}
                close={<div onClick={() => this._openPopup(false)}>ok</div>}
            ></PopUp>
        }
    }

    /**
     * set message status
     */
    private _updateMessageStatus() {
        this.setState({ message: true });
    }

    /**
     * Show Order search box
     */
    private _showSearchBox() {
        if (this.state.Orders) {
            const filteredOrders = this.state.Orders.filter((order) => {
                return (order.favourite.toLocaleLowerCase().indexOf(this.state.queryOrders) || this._showDate(order.date).toLocaleLowerCase().indexOf(this.state.queryDate)) !== -1;
            });
            return <div>
                <input
                    className="search_box_middle_big"
                    placeholder="Search by Name"
                    type="text"
                    onKeyUp={(e) => this._onOrderSearch(e.currentTarget.value)}
                />
                <input
                    className="favo_right_search"
                    placeholder="Search by Date"
                    type="text"
                    onKeyUp={(e) => this._onByDate(e.currentTarget.value)}
                />
                {this._showFavouritesList(filteredOrders)}
            </div>
        }
    }

    /**
     * Update query  by name 
     * @param query 
     */
    private _onOrderSearch(query: string) {
        this.setState({ queryOrders: query.toLocaleLowerCase() });
    }

    /**
     * Update query by date
     * @param query
     */
    private _onByDate(query: string) {
        this.setState({ queryDate: query.toLocaleLowerCase() });
    }

    private _showFavouritesList(list: OrdersItem[]) {
        return <div className="favorites_list">
            <div className="display_buttons">
                <button className="header_button">Name</button>
                <button className="header_button">Date</button>
                <button className="header_button">Status</button>
            </div>
            {list.map((order, index) => {
                return <div key={index}>
                    <div className="display_buttons" onClick={() => this._selectOrder(order)}>
                        <button className="item_button">{order.favourite}</button>
                        <button className="item_button">{this._showDate(order.date)}</button>
                        <button className="item_button">{this._showOrderStatus(order.confirmed)}</button>
                    </div>

                </div>
            })}
        </div>
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
     *  Change current order to the one selected
     */
    private _selectOrder(order: OrdersItem) {
        if (this.state.currentOrder) {
            this.setState({ currentOrder: null });
        } else {
            this.setState({ currentOrder: order });
        }
    }

    /**
     * Show order options
     */
    private _showOrderOptions() {
        if (this.state.currentOrder) {
            return <ul className="favo_options">
                <div onClick={() => this._selectEditOrder(true)} ><img className="image_icon" src={Edit} alt="edit"></img></div>
                <div onClick={() => this._selectSendOrder(true)} ><img className="image_icon" src={Send} alt="send"></img></div>
                <div onClick={() => this._selectRemoveOrder(true)} ><img className="image_icon" src={Delete} alt="delete"></img></div>
            </ul>;
        }
    }

    /**
     *  Change remove Order state to true
     */
    private _selectRemoveOrder(bool: boolean) {
        this.setState({ removeOrder: bool });
    }

    /**
     * Show delete product dialog
     */
    private _showRemoveOrder() {
        if (this.state.removeOrder == true) {
            return <Dialog
                title={"Remove Order"}
                body={<div className="dialog_content_message">
                    <div >
                        Are you sure you want unfavourite?
                    </div>
                </div>}
                cancel={<button className="item_button" onClick={() => this._selectRemoveOrder(false)}>Cancel</button>}
                submit={<button className="item_button" onClick={() => this._unFavourite()}>Remove</button>}
            >
            </Dialog>
        } else {
            return
        }
    }

    /**
     * Make unfavourite order in database and state
     */
    private _unFavourite() {
        (async () => {
            try {
                //update message
                this._setMessage("Removing", "Order Unfavorited");
                const token = getAuthToken();
                //if user is logged in and there is a item list set
                if (token && this.state.currentOrder && this.state.Orders) {
                    // Reset error
                    this.setState({ error: null });
                    let orders = this.state.Orders;
                    //remove order from state
                    const index = orders.indexOf(this.state.currentOrder, 0);
                    if (index > -1) {
                        orders.splice(index, 1);
                    }
                    this.setState({ Orders: orders });
                    //unfavourite order in database
                    const order = await unfavouriteOrder(this.state.currentOrder.id, token);
                    //close dialog
                    this._selectRemoveOrder(false);
                    //update message
                    this._updateMessageStatus();
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    /**
     *  Change send Order state to true
     */
    private _selectSendOrder(bool: boolean) {
        this.setState({ sendOrder: bool });
    }

    /**
     * Proceed to order confirmation to send current favourite order
     */
    private _sendOrder() {
        if (this.state.currentOrder && this.state.sendOrder == true) {
            //go to the confirm order's page
            this.props.history.push(`confirmorder/${this.state.currentOrder.id}`);
        }
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
     *  Change remove Order state to true
     */
    private _selectEditOrder(bool: boolean) {
        this.setState({ editOrder: bool });
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
        if (this.state.currentOrder && this.state.editOrder == true) {
            //go to the new order's page
            this.props.history.push(`neworder/${this.state.currentOrder.id}`);
        }
    }
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
 * Get user info using token
 */
async function getFavourites(id: number) {
    return new Promise(function (resolve, reject) {
        (async () => {
            const response = await fetch(
                `/api/v1/orders/favorites/${id}`,
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
 * Patch order to make it favourite
 * 
 * @param id 
 * @param name 
 * @param jwt 
 */
async function unfavouriteOrder(id: number, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const update = {
                favourite: "false"
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



