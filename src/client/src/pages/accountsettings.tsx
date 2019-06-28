import React from 'react';
import { getAuthToken } from '../components/with_auth/with_auth';
import * as H from 'history';
import * as joi from "joi";
import { Dialog } from '../components/dialog/dialog';
import { PopUp } from '../components/popup/popup';

/**
 * validation schema for emails
 */
const credentialSchema = {
    email: joi.string().email().required(),
    email2: joi.any().valid(joi.ref('email')).required().options({ language: { any: { allowOnly: 'must match email' } } }).label('Email Confirmation')
    //password: joi.string().min(3).max(30).required()
};

/**
 * validation schema for passwords
 */
const passwordCredentialSchema = {
    password: joi.string().min(3).max(30).required(),
    password2: joi.any().valid(joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } }).label('Password Confirmation')

};


/**
 * Style for button holding each order
 */
const orderHistoryButton: React.CSSProperties = {
    background: "none",
    border: "none"
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
interface AccountSettingsProps {
    history: H.History;
}

/**
 * State for the page
 */
interface AccountSettingsState {
    settings: boolean | null;
    myDetails: boolean | null;
    orderHistory: boolean | null;
    deleteAccount: boolean | null;
    logout: boolean | null;
    changeEmail: boolean | null;
    newEmail: string | null;
    newEmail2: string | null;
    changePassword: boolean | null;
    currentPassword: string | null;
    newPassword: string | null;
    newPassword2: string | null;
    changeContactName: boolean | null;
    newContactName: string | null;
    changeCompanyName: boolean | null;
    newCompanyName: string | null;
    deletedProducts: ProductsItem[] | null;
    deletedSuppliers: SuppliersItem[] | null;
    products: boolean | null;
    suppliers: boolean | null;
    message: boolean | null;
    passwordMessage: boolean | null;
    contactNameMessage: boolean | null;
    companyNameMessage: boolean | null;
    deletedAccountMessage: boolean | null;
    queryOrders: string;
    queryProducts: string;
    querySuppliers: string;
    user: UserItem | null;
    token: string | null;
    error: string | null;
}

/**
 * Class constructor
 */
export class AccountSettings extends React.Component<AccountSettingsProps, AccountSettingsState> {
    public constructor(props: AccountSettingsProps) {
        super(props);
        this.state = {
            settings: true,
            myDetails: false,
            orderHistory: false,
            deleteAccount: false,
            logout: false,
            changeEmail: false,
            newEmail: "",
            newEmail2: "",
            changePassword: false,
            currentPassword: "",
            newPassword: "",
            newPassword2: "",
            changeContactName: false,
            newContactName: "",
            changeCompanyName: false,
            newCompanyName: "",
            deletedProducts: null,
            deletedSuppliers: null,
            products: false,
            suppliers: false,
            message: false,
            passwordMessage: false,
            contactNameMessage: false,
            companyNameMessage: false,
            deletedAccountMessage: false,
            user: null,
            queryOrders: "",
            querySuppliers: "",
            queryProducts: "",
            token: null,
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
                this.setState({ token: token })
                const user = await getUser(token) as UserItem;
                this.setState({ user: user });
                const products = await getDeletedProducts(user.id) as ProductsItem[];
                const suppliers = await getDeletedSuppliers(user.id) as SuppliersItem[];
                this.setState({ deletedProducts: products });
                this.setState({ deletedSuppliers: suppliers });
            }
        })();
    }

    /**
     * Render main component
     */
    public render() {
        if (this.state.user === null) {
            return <h1>Loading...</h1>;
        } else {
            return [
                <h1>
                    Account Settings
                </h1>,
                <div>
                    {this._showProductSearchBox()}
                    {this._showSupplierSearchBox()}
                    {this._showSearchBox()}
                    {this._showOptions()}
                    {this._showMyDetails()}
                    {this._showDeleteAccount()}
                    {this._showLogout()}
                    {this._showChangeEmail()}
                    {this._showEmailUpdatedMessage()}
                    {this._showChangePassword()}
                    {this._showPasswordUpdatedMessage()}
                    {this._showChangeContactName()}
                    {this._showContactNameUpdatedMessage()}
                    {this._showChangeCompanyName()}
                    {this._showCompanyNameUpdatedMessage()}
                    {this._showAccountDeletedMessage()}
                </div>
            ]
        }
    }

    /**
     * Show main options
     * Change inferface layout depending on the option selected
     */
    private _showOptions() {
        if (this.state.settings == true && this.state.myDetails == true) {
            return <div className="settings_list_left">
                <button onClick={() => this._selectMyDetails(true)} className="header_button_big">My Details</button>
                <button onClick={() => this._selectOrderHistory(true)} className="item_button_big">Order History</button>
                <button onClick={() => this._selectDeletedProducts(true)} className="item_button_big">Deleted Products</button>
                <button onClick={() => this._selectDeletedSuppliers(true)} className="item_button_big">Deleted Suppliers</button>
                <button onClick={() => this._selectDeleteAccount(true)} className="item_button_big">Delete Account</button>
                <button onClick={() => this._selectLogout(true)} className="item_button_big">Logout</button>
            </div>
        } else if (this.state.settings == true && this.state.orderHistory == true) {
            return <div className="settings_list_left_left">
                <button onClick={() => this._selectMyDetails(true)} className="item_button_big">My Details</button>
                <button onClick={() => this._selectOrderHistory(true)} className="header_button_big">Order History</button>
                <button onClick={() => this._selectDeletedProducts(true)} className="item_button_big">Deleted Products</button>
                <button onClick={() => this._selectDeletedSuppliers(true)} className="item_button_big">Deleted Suppliers</button>
                <button onClick={() => this._selectDeleteAccount(true)} className="item_button_big">Delete Account</button>
                <button onClick={() => this._selectLogout(true)} className="item_button_big">Logout</button>
            </div>
        } else if (this.state.settings == true && this.state.deleteAccount) {
            return <div className="settings_list_left_left">
                <button onClick={() => this._selectMyDetails(true)} className="item_button_big">My Details</button>
                <button onClick={() => this._selectOrderHistory(true)} className="item_button_big">Order History</button>
                <button onClick={() => this._selectDeletedProducts(true)} className="item_button_big">Deleted Products</button>
                <button onClick={() => this._selectDeletedSuppliers(true)} className="item_button_big">Deleted Suppliers</button>
                <button onClick={() => this._selectDeleteAccount(true)} className="header_button_big">Delete Account</button>
                <button onClick={() => this._selectLogout(true)} className="item_button_big">Logout</button>
            </div>
        } else if (this.state.settings == true && this.state.logout) {
            return <div className="settings_list_left_left">
                <button onClick={() => this._selectMyDetails(true)} className="item_button_big">My Details</button>
                <button onClick={() => this._selectOrderHistory(true)} className="item_button_big">Order History</button>
                <button onClick={() => this._selectDeletedProducts(true)} className="item_button_big">Deleted Products</button>
                <button onClick={() => this._selectDeletedSuppliers(true)} className="item_button_big">Deleted Suppliers</button>
                <button onClick={() => this._selectDeleteAccount(true)} className="item_button_big">Delete Account</button>
                <button onClick={() => this._selectLogout(true)} className="header_button_big">Logout</button>
            </div>
        } else if (this.state.settings == true && this.state.suppliers == true) {
            return <div className="settings_list_left_left">
                <button onClick={() => this._selectMyDetails(true)} className="item_button_big">My Details</button>
                <button onClick={() => this._selectOrderHistory(true)} className="item_button_big">Order History</button>
                <button onClick={() => this._selectDeletedProducts(true)} className="item_button_big">Deleted Products</button>
                <button onClick={() => this._selectDeletedSuppliers(true)} className="header_button_big">Deleted Suppliers</button>
                <button onClick={() => this._selectDeleteAccount(true)} className="item_button_big">Delete Account</button>
                <button onClick={() => this._selectLogout(true)} className="item_button_big">Logout</button>
            </div>
        } else if (this.state.settings == true && this.state.products == true) {
            return <div className="settings_list_left_left">
                <button onClick={() => this._selectMyDetails(true)} className="item_button_big">My Details</button>
                <button onClick={() => this._selectOrderHistory(true)} className="item_button_big">Order History</button>
                <button onClick={() => this._selectDeletedProducts(true)} className="header_button_big">Deleted Products</button>
                <button onClick={() => this._selectDeletedSuppliers(true)} className="item_button_big">Deleted Suppliers</button>
                <button onClick={() => this._selectDeleteAccount(true)} className="item_button_big">Delete Account</button>
                <button onClick={() => this._selectLogout(true)} className="item_button_big">Logout</button>
            </div>
        } else if (this.state.settings == true) {
            return <div className="settings_list">
                <button onClick={() => this._selectMyDetails(true)} className="item_button_big">My Details</button>
                <button onClick={() => this._selectOrderHistory(true)} className="item_button_big">Order History</button>
                <button onClick={() => this._selectDeletedProducts(true)} className="item_button_big">Deleted Products</button>
                <button onClick={() => this._selectDeletedSuppliers(true)} className="item_button_big">Deleted Suppliers</button>
                <button onClick={() => this._selectDeleteAccount(true)} className="item_button_big">Delete Account</button>
                <button onClick={() => this._selectLogout(true)} className="item_button_big">Logout</button>
            </div>
        }
    }
    /**
     *  Change my details state 
     */
    private _selectMyDetails(bool: boolean) {
        if (this.state.products || this.state.suppliers || this.state.myDetails || this.state.orderHistory || this.state.deleteAccount || this.state.logout) {
            this.setState({ myDetails: null });
            this.setState({ orderHistory: null });
            this.setState({ deleteAccount: null });
            this.setState({ logout: null });
            this.setState({ products: null });
            this.setState({ suppliers: null });
        } else {
            this.setState({ myDetails: bool });
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

    /**
     * Show my details component depending on boolean
     */
    private _showMyDetails() {
        if (this.state.myDetails == true) {
            return <div className="settings_list_right">
                <button onClick={() => this._selectChangeEmail(true)} className="item_button_big">Change Email</button>
                <button onClick={() => this._selectChangePassword(true)} className="item_button_big">Change Password</button>
                <button onClick={() => this._selectChangeContactName(true)} className="item_button_big">Change Contact Name</button>
                <button onClick={() => this._selectChangeCompanyName(true)} className="item_button_big">Change Company Name</button>
            </div>;
        }
    }

    /************************************************************************************************
     * 
     * Code related to order history option
     * 
     * **********************************************************************************************
     */

    /**
     *  Change order history state
     */
    private _selectOrderHistory(bool: boolean) {
        if (this.state.orderHistory || this.state.myDetails || this.state.deleteAccount || this.state.logout || this.state.products || this.state.suppliers) {
            this.setState({ orderHistory: null });
            this.setState({ myDetails: null });
            this.setState({ deleteAccount: null });
            this.setState({ logout: null });
            this.setState({ products: null });
            this.setState({ suppliers: null });
        } else {
            this.setState({ orderHistory: bool });
        }
    }

    /**
     * Show order History depending on boolean
     */
    private _showOrderHistory(list: OrdersItem[]) {
        if (this.state.orderHistory == true) {
            return <div className="settings_list_right_big">
                <button className="header_button_big" >Date</button>
                <button className="header_button_big" >Status</button>
                <button className="header_button_big" >Show More</button>
                {list.map((order, index) => {
                    return <div onClick={() => this._handleMoreDetails(order)} style={orderHistoryButton} key={index}><button /*onClick={() => this._selectSupplier(supplier)}*/ className="item_button_big" >{this._showDate(order.date)}</button>
                        <button className="item_button_big" >{this._showOrderStatus(order.confirmed)}</button>
                        <button className="item_button_big" >More Details</button>
                    </div>;
                })}
            </div>;
        }
    }

    /**
     * Handle show order details
     */
    private _handleMoreDetails(order: OrdersItem) {
        (async () => {
            try {
                /**
                * (go to '/' 1st otherwise it redirects to neworder/confirmorder/orderId 
                * if there is params)
                */
                this.props.history.push(`/`);
                this.props.history.push(`orderdetails/${order.id}`);
                //this._updateMessageStatus();

            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
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
     * Show Order search box
     */
    private _showSearchBox() {
        if (this.state.user && this.state.orderHistory == true) {
            const filteredOrders = this.state.user.orders.filter((order) => {
                return this._showDate(order.date).toLocaleLowerCase().indexOf(this.state.queryOrders) !== -1;
            });
            return <div>
                <input
                    className="search_box_settings"
                    placeholder="Search by Date"
                    type="text"
                    onKeyUp={(e) => this._onOrderSearch(e.currentTarget.value)}
                />
                {this._showOrderHistory(filteredOrders)}
            </div>
        }
    }

    private _onOrderSearch(query: string) {
        this.setState({ queryOrders: query.toLocaleLowerCase() });
    }

    /************************************************************************************************
     * 
     * Code related to products option
     * 
     * **********************************************************************************************
     */

    /**
     *  Change deleted products state
     */
    private _selectDeletedProducts(bool: boolean) {
        if (this.state.products || this.state.orderHistory || this.state.myDetails || this.state.deleteAccount || this.state.products || this.state.suppliers) {
            this.setState({ products: null });
            this.setState({ orderHistory: null });
            this.setState({ myDetails: null });
            this.setState({ deleteAccount: null });
            this.setState({ logout: null });
            this.setState({ suppliers: null });
        } else {
            this.setState({ products: bool });
        }
    }

    /**
     * Show deleted products depending on boolean
     */
    private _showDeletedProducts(list: ProductsItem[]) {
        if (this.state.products == true) {
            return <div className="settings_list_right_big">
                <button className="header_button_big" >Name</button>
                <button className="header_button_big" >Suppliers</button>
                <button className="header_button_big" >Restore</button>
                {list.map((product, index) => {
                    return <div style={orderHistoryButton} key={index}>
                        <button /*onClick={() => this._selectSupplier(supplier)}*/ className="item_button_big" >{product.name}</button>
                        <button className="item_button_big" >{product.supplier.companyName}</button>
                        <button onClick={() => this._handleRestoreProduct(product)} className="item_button_big" >Restore</button>
                    </div>;
                })}
            </div>;

        }
    }

    /**
     * Handle show order details
     */
    private _handleRestoreProduct(product: ProductsItem) {
        (async () => {
            if (this.state.token && this.state.deletedProducts) {
                try {
                    /**
                    * Restore product in database
                    */
                    const products = await RestoreProduct(product.id, this.state.token) as unknown as ProductsItem;
                    /**
                     * Remove product from deleted products in state
                     */
                    let currentProducts = this.state.deletedProducts;
                    let index = currentProducts.findIndex(x => x.id == products.id)
                    if (index > -1) {
                        currentProducts.splice(index, 1);
                    }
                    this.setState({deletedProducts : currentProducts});
                    //this.props.history.push(`orderdetails/${order.id}`);
                    //this._updateMessageStatus();

                } catch (err) {
                    this.setState({ error: err.error });
                }
            }
        })();
    }

    /**
     * Show Order search box
     */
    private _showProductSearchBox() {
        if (this.state.deletedProducts && this.state.products) {
            const filteredProducts = this.state.deletedProducts.filter((product) => {
                return product.name.toLocaleLowerCase().indexOf(this.state.queryProducts) !== -1;
            });
            return <div>
                <input
                    className="search_box_settings"
                    placeholder="Search by Name"
                    type="text"
                    onKeyUp={(e) => this._onProductSearch(e.currentTarget.value)}
                />
                {this._showDeletedProducts(filteredProducts)}
            </div>
        }
    }

    private _onProductSearch(query: string) {
        this.setState({ queryProducts: query.toLocaleLowerCase() });
    }

    /************************************************************************************************
     * 
     * Code related to suppliers option
     * 
     * **********************************************************************************************
     */

    /**
     *  Change deleted products state
     */
    private _selectDeletedSuppliers(bool: boolean) {
        if (this.state.suppliers || this.state.products || this.state.orderHistory || this.state.myDetails || this.state.deleteAccount || this.state.logout) {
            this.setState({ suppliers: null });
            this.setState({ orderHistory: null });
            this.setState({ myDetails: null });
            this.setState({ deleteAccount: null });
            this.setState({ products: null });
            this.setState({ logout: null });
        } else {
            this.setState({ suppliers: bool });
        }
    }

    /**
     * Show deleted suppliers depending on boolean
     */
    private _showDeletedSuppliers(list: SuppliersItem[]) {
        console.log("List: " + list)
        if (this.state.suppliers == true) {
            return <div className="settings_list_right_big">
                <button className="header_button_big" >Company</button>
                <button className="header_button_big" >Contact</button>
                <button className="header_button_big" >Restore</button>
                {list.map((supplier, index) => {
                    return <div style={orderHistoryButton} key={index}>
                        <button /*onClick={() => this._selectSupplier(supplier)}*/ className="item_button_big" >{supplier.companyName}</button>
                        <button className="item_button_big" >{supplier.contactName}</button>
                        <button onClick={() => this._handleRestoreSupplier(supplier)} className="item_button_big" >Restore</button>
                    </div>;
                })}
            </div>;

        }
    }

    /**
     * Handle show order details
     */
    private _handleRestoreSupplier(supplier: SuppliersItem) {
        (async () => {
            if (this.state.token && this.state.deletedSuppliers) {
                try {
                    /**
                    * (go to '/' 1st otherwise it redirects to neworder/confirmorder/orderId 
                    * if there is params)
                    */
                    const suppliers = await restoreSupplier(supplier.id, this.state.token) as unknown as SuppliersItem;
                    /**
                     * Remove supplier from deleted products in state
                     */
                    let currentSuppliers = this.state.deletedSuppliers;
                    let index = currentSuppliers.findIndex(x => x.id == suppliers.id)
                    if (index > -1) {
                        currentSuppliers.splice(index, 1);
                    }
                    this.setState({deletedSuppliers : currentSuppliers});
                } catch (err) {
                    this.setState({ error: err.error });
                }
            }
        })();
    }

    /**
     * Show Order search box
     */
    private _showSupplierSearchBox() {
        if (this.state.deletedSuppliers && this.state.suppliers) {
            const filteredSuppliers = this.state.deletedSuppliers.filter((supplier) => {
                return supplier.companyName.toLocaleLowerCase().indexOf(this.state.querySuppliers) !== -1;
            });
            return <div>
                <input
                    className="search_box_settings"
                    placeholder="Search by Name"
                    type="text"
                    onKeyUp={(e) => this._onSupplierSearch(e.currentTarget.value)}
                />
                {this._showDeletedSuppliers(filteredSuppliers)}
            </div>
        }
    }

    private _onSupplierSearch(query: string) {
        this.setState({ querySuppliers: query.toLocaleLowerCase() });
    }


    /************************************************************************************************
     * 
     * Code related to delete account option
     * 
     * **********************************************************************************************
     */

    /**
     *  Change delete account state 
     *  and close the others
     */
    private _selectDeleteAccount(bool: boolean) {
        if (this.state.orderHistory || this.state.myDetails || this.state.deleteAccount || this.state.logout) {
            this.setState({ deleteAccount: null });
            this.setState({ orderHistory: null });
            this.setState({ myDetails: null });
            this.setState({ logout: null });
            this.setState({ products: null });
        } else {
            this.setState({ deleteAccount: bool });
        }
    }

    /**
     * Show delete account component depending on boolean
     */
    private _showDeleteAccount() {
        if (this.state.deleteAccount == true) {
            if (this.state.user) {
                return <Dialog
                    title={"Delete Account"}
                    body={<div >
                        <div className="dialog_content_message">
                            Are you sure you want to delete your Account?
                    </div>
                        <div className="small_Form_Input_Dialog">
                            Insert Password
                <input
                                type="password"
                                placeholder="Password"
                                onKeyUp={(e) => this._updateCurrentPassword((e as any).target.value)}
                            />
                        </div>
                    </div>}
                    cancel={<button className="item_button" onClick={() => this._selectDeleteAccount(false)}>Cancel</button>}
                    submit={<button className="item_button" onClick={() => this._handleDeleteAccount()}>Delete</button>}
                >
                </Dialog>
            }
        }
    }

    /**
     *Delete user from database and state
     */
    private _handleDeleteAccount() {
        (async () => {
            try {

                /**
                 * if user is logges in
                 * if it password matches
                 */
                if (this.state.token && this.state.user && this.state.user.password == this.state.currentPassword) {
                    // Reset error
                    this.setState({ error: null });
                    const user = await deleteUser(this.state.user.id, this.state.token);
                    //update popup and dialog
                    this.props.history.push(`/login`);
                    this._selectDeleteAccount(false);
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    /**
     * Show account deleted popup
     */
    private _showAccountDeletedMessage() {
        if (this.state.deletedAccountMessage == true) {
            return <PopUp
                title={"Account"}
                message={"Account Deleted"}
                close={<div onClick={() => this._logout()}>close</div>}
            ></PopUp>
        }
    }

    /*********************************************************************************************
     * 
     * Code Related to Logging out option
     * 
     **********************************************************************************************/

    /**
     *  Change logout state 
     */
    private _selectLogout(bool: boolean) {
        if (this.state.logout || this.state.orderHistory || this.state.myDetails || this.state.deleteAccount) {
            this.setState({ logout: null });
            this.setState({ deleteAccount: null });
            this.setState({ orderHistory: null });
            this.setState({ myDetails: null });
            this.setState({ products: null });
        } else {
            this.setState({ logout: bool });
        }
    }



    /**
     * Show delete account component depending on boolean
     */
    private _showLogout() {
        if (this.state.logout == true) {
            return <Dialog
                title={"Logout"}
                body={<div className="dialog_content_message">
                    <div >
                        Are you sure you want to logout?
                    </div>
                </div>}
                cancel={<button className="item_button" onClick={() => this._selectLogout(false)}>Cancel</button>}
                submit={<button className="item_button" onClick={() => this._logout()}>logout</button>}
            >
            </Dialog>
        }
    }

    /**
     * Send user to login page
     */
    private _logout() {
        //go to the confirm order's page
        this.props.history.push(`/login`);
    }

    /**********************************************************************************************
     * 
     * Code Related to Change Email Option
     * 
     **********************************************************************************************/

    /**
     * Change change email state
     */
    private _selectChangeEmail(bool: boolean) {
        if (this.state.changeEmail) {
            this.setState({ changeEmail: null });
        } else {
            this.setState({ changeEmail: bool });
        }
    }

    /**
     * Show change email component depending on state
     */
    private _showChangeEmail() {
        if (this.state.changeEmail == true) {
            return <Dialog
                title={"Change Email"}
                body={<div className="dialog_content_form">
                    <div >{this._renderValidationErrors()}</div>
                    <div className="small_Form_Input_Dialog">
                        New Email
                <input

                            type="text"
                            placeholder="New email"
                            onKeyUp={(e) => this._updateNewEmail((e as any).target.value)}
                        />
                    </div>
                    <div className="small_Form_Input_Dialog">
                        Repeat Email
                <input
                            type="text"
                            placeholder="Repeat email"
                            onKeyUp={(e) => this._updateNewEmail2((e as any).target.value)}
                        />
                    </div>
                    <div className="small_Form_Input_Dialog">
                        Password
                <input
                            type="password"
                            placeholder="password"
                            onKeyUp={(e) => this._updateCurrentPassword((e as any).target.value)}
                        />
                    </div>
                </div>}
                cancel={<button className="item_button" onClick={() => this._selectChangeEmail(false)}>Cancel</button>}
                submit={<button className="item_button" onClick={() => this._handleChangeEmail()}>ok</button>}
            >
            </Dialog>
        }
    }

    // Update the state (newEmail) on keyup
    private _updateNewEmail(email: string) {
        this.setState({ newEmail: email });
    }
    // Update the state (newEmail) on keyup
    private _updateNewEmail2(email: string) {
        this.setState({ newEmail2: email });
    }

    // Display errors or OK on screen
    private _renderValidationErrors() {
        const validationResult = joi.validate({
            email: this.state.newEmail,
            email2: this.state.newEmail2
        }, credentialSchema);
        if (validationResult.error) {
            return <div className="error-msg">
                {validationResult.error.details.map(d => <div>{d.message}</div>)}
            </div>;
        } else {
            return <div className="success-msg">OK!</div>;
        }
    }

    /**
     * Change Email
     */
    private _handleChangeEmail() {
        (async () => {
            try {

                //if user is logged in and new email is set
                if (this.state.token && this.state.newEmail && this.state.user && this.state.currentPassword ==  this.state.user.password) {
                    // Reset error
                    this.setState({ error: null });
                    const user = await updateEmail(this.state.user.id, this.state.newEmail, this.state.token);
                    //update popup and dialog
                    this._openPopup(true);
                    this._selectChangeEmail(false);
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    /**
     * Show email updated popup
     */
    private _showEmailUpdatedMessage() {
        if (this.state.message == true) {
            return <PopUp
                title={"Email"}
                message={"Email updated"}
                close={<div onClick={() => this._openPopup(false)}>close</div>}
            ></PopUp>
        }
    }

    

     /**********************************************************************************************
     * 
     * Code Related to Change Password Option
     * 
     **********************************************************************************************/

    /**
     * Change change password state
     */
    private _selectChangePassword(bool: boolean) {
        if (this.state.changePassword) {
            this.setState({ changePassword: null });
        } else {
            this.setState({ changePassword: bool });
        }
    }

    /**
     * Show change email component depending on state
     */
    private _showChangePassword() {
        if (this.state.changePassword == true) {
            return <Dialog
                title={"Change Password"}
                body={<div className="dialog_content_form">
                    <div >{this._renderPasswordValidationErrors()}</div>
                    <div className="small_Form_Input_Dialog">
                        Current Password
                <input

                            type="password"
                            placeholder="Current Password"
                            onKeyUp={(e) => this._updateCurrentPassword((e as any).target.value)}
                        />
                    </div>
                    <div className="small_Form_Input_Dialog">
                        New Password
                <input
                            type="password"
                            placeholder="New Password"
                            onKeyUp={(e) => this._updateNewPassword((e as any).target.value)}
                        />
                    </div>
                    <div className="small_Form_Input_Dialog">
                        Repeat New Password
                <input
                            type="password"
                            placeholder="Repeat New Password"
                            onKeyUp={(e) => this._updateNewPassword2((e as any).target.value)}
                        />
                    </div>
                </div>}
                cancel={<button className="item_button" onClick={() => this._selectChangePassword(false)}>Cancel</button>}
                submit={<button className="item_button" onClick={() => this._handleChangePassword()}>ok</button>}
            >
            </Dialog>
        }
    }

    // Update the state (current Password) on keyup
    private _updateCurrentPassword(pass: string) {
        this.setState({ currentPassword: pass });
    }
    // Update the state (new Password) on keyup
    private _updateNewPassword(pass: string) {
        this.setState({ newPassword: pass });
    }
    // Update the state (new Password2) on keyup
    private _updateNewPassword2(pass: string) {
        this.setState({ newPassword2: pass });
    }

    // Display errors or OK on screen
    private _renderPasswordValidationErrors() {
        const validationResult = joi.validate({
            password: this.state.newPassword,
            password2: this.state.newPassword2
        }, passwordCredentialSchema);
        if (validationResult.error) {
            return <div className="error-msg">
                {validationResult.error.details.map(d => <div>{d.message}</div>)}
            </div>;
        } else {
            return <div className="success-msg">OK!</div>;
        }
    }

    /**
     * Change user password on database
     */
    private _handleChangePassword() {
        (async () => {
            try {

                /**
                 * if user is logges in
                 * if it password matches
                 */
                if (this.state.token && this.state.newPassword && this.state.newPassword2 && this.state.user
                     && this.state.currentPassword ==  this.state.user.password) {
                    // Reset error
                    this.setState({ error: null });
                    const user = await updatePassword(this.state.user.id, this.state.newPassword, this.state.token);
                    //update popup and dialog
                    this._openPasswordPopup(true);
                    this._selectChangePassword(false);
                    this.props.history.push(`/login`);
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    /**
     * Show password updated popup
     */
    private _showPasswordUpdatedMessage() {
        if (this.state.passwordMessage == true) {
            return <PopUp
                title={"Password"}
                message={"Password updated"}
                close={<div onClick={() => this._openPasswordPopup(false)}>close</div>}
            ></PopUp>
        }
    }

    /**
     * open or close  password popup message
     * @param bool 
     */
    private _openPasswordPopup(bool: boolean) {
        if (this.state.passwordMessage) {
            this.setState({ passwordMessage: null });
        } else {
            this.setState({ passwordMessage: bool });
        }
    }

    /**********************************************************************************************
     * 
     * Code Related to Change Contact Name Option
     * 
     **********************************************************************************************/

    /**
     * Update change company name state
     */
    private _selectChangeContactName(bool: boolean) {
        if (this.state.changeContactName) {
            this.setState({ changeContactName: null });
        } else {
            this.setState({ changeContactName: bool });
        }
    }

    /**
     * Show change contactName component depending on state
     */
    private _showChangeContactName() {
        if (this.state.changeContactName == true) {
            return <Dialog
                title={"Change Contact Name"}
                body={<div className="dialog_content_form">
                    <div className="small_Form_Input_Dialog">
                        New Contact Name
                <input

                            type="text"
                            placeholder="New Name"
                            onKeyUp={(e) => this._updateNewContactName((e as any).target.value)}
                        />
                    </div>
                    <div className="small_Form_Input_Dialog">
                        Password
                <input
                            type="password"
                            placeholder="Password"
                            onKeyUp={(e) => this._updateCurrentPassword((e as any).target.value)}
                        />
                    </div>
                </div>}
                cancel={<button className="item_button" onClick={() => this._selectChangeContactName(false)}>Cancel</button>}
                submit={<button className="item_button" onClick={() => this._handleChangeContactName()}>ok</button>}
            >
            </Dialog>
        }
    }

    // Update the state (newContactName) on keyup
    private _updateNewContactName(name: string) {
        this.setState({ newContactName: name });
    }

    /**
     * Handle user patch
     */
    private _handleChangeContactName() {
        (async () => {
            try {

                /**
                 * If user is looged in
                 * and password matches
                 */
                if (this.state.token && this.state.newContactName && this.state.user
                    && this.state.user.password == this.state.currentPassword) {
                    // Reset error
                    this.setState({ error: null });
                    const user = await updateContactName(this.state.user.id, this.state.newContactName, this.state.token);
                    //update popup and dialog
                    this._openContactNamePopup(true);
                    this._selectChangeContactName(false);
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    /**
     * Show email updated popup
     */
    private _showContactNameUpdatedMessage() {
        if (this.state.contactNameMessage == true) {
            return <PopUp
                title={"Contact Name"}
                message={"Contact Name updated"}
                close={<div onClick={() => this._openContactNamePopup(false)}>close</div>}
            ></PopUp>
        }
    }

    /**
     * open or close popup message
     * @param bool 
     */
    private _openContactNamePopup(bool: boolean) {
        if (this.state.contactNameMessage) {
            this.setState({ contactNameMessage: null });
        } else {
            this.setState({ contactNameMessage: bool });
        }
    }

    /**********************************************************************************************
     * 
     * Code Related to Change Company Name Option
     * 
     **********************************************************************************************/

    /**
     * Update change contact name state
     */
    private _selectChangeCompanyName(bool: boolean) {
        if (this.state.changeCompanyName) {
            this.setState({ changeCompanyName: null });
        } else {
            this.setState({ changeCompanyName: bool });
        }
    }

    /**
     * Show change CompanyName component depending on state
     */
    private _showChangeCompanyName() {
        if (this.state.changeCompanyName == true) {
            return <Dialog
                title={"Change Company Name"}
                body={<div className="dialog_content_form">
                    <div className="small_Form_Input_Dialog">
                        New Company Name
                <input

                            type="text"
                            placeholder="New Name"
                            onKeyUp={(e) => this._updateNewCompanyName((e as any).target.value)}
                        />
                    </div>
                    <div className="small_Form_Input_Dialog">
                        Password
                <input
                            type="password"
                            placeholder="Password"
                            onKeyUp={(e) => this._updateCurrentPassword((e as any).target.value)}
                        />
                    </div>
                </div>}
                cancel={<button className="item_button" onClick={() => this._selectChangeCompanyName(false)}>Cancel</button>}
                submit={<button className="item_button" onClick={() => this._handleChangeCompanyName()}>ok</button>}
            >
            </Dialog>
        }
    }

    // Update the state (newCompanyName) on keyup
    private _updateNewCompanyName(name: string) {
        this.setState({ newCompanyName: name });
    }

    /**
     * Handle user patch
     */
    private _handleChangeCompanyName() {
        (async () => {
            try {
                //update popup and dialog
                this._openCompanyNamePopup(true);
                this._selectChangeCompanyName(false);
                /**
                 * If user is looged in
                 * and password matches
                 */
                if (this.state.token && this.state.newCompanyName && this.state.user &&
                    this.state.user.password == this.state.currentPassword ) {
                    // Reset error
                    this.setState({ error: null });
                    const user = await updateCompanyName(this.state.user.id, this.state.newCompanyName, this.state.token);
                    
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    /**
     * Show email updated popup
     */
    private _showCompanyNameUpdatedMessage() {
        if (this.state.companyNameMessage == true) {
            return <PopUp
                title={"Company Name"}
                message={"Company Name updated"}
                close={<div onClick={() => this._openCompanyNamePopup(false)}>close</div>}
            ></PopUp>
        }
    }

    /**
     * open or close popup message
     * @param bool 
     */
    private _openCompanyNamePopup(bool: boolean) {
        if (this.state.companyNameMessage) {
            this.setState({ companyNameMessage: null });
        } else {
            this.setState({ companyNameMessage: bool });
        }
    }

}

/**
 * Delete User Request
 */
async function deleteUser(id: number, jwt: string) {
    return new Promise(function (resolve, reject) {
        (async () => {
            const response = await fetch(
                `/api/v1/users/${id}`,
                {
                    method: "DELETE",
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
 * Update Contact name Request
 */
async function updateContactName(id: number, contactName: string, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const update = {
                contactName: contactName
            };
            const response = await fetch(
                `/api/v1/users/${id}`,
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
 * Update Company name Request
 */
async function updateCompanyName(id: number, companyName: string, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const update = {
                companyName: companyName
            };
            const response = await fetch(
                `/api/v1/users/${id}`,
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
 * Update Email Request
 */
async function updateEmail(id: number, email: string, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const update = {
                email: email
            };
            const response = await fetch(
                `/api/v1/users/${id}`,
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
 * Update Password Request
 */
async function updatePassword(id: number, password: string, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const update = {
                password: password
            };
            const response = await fetch(
                `/api/v1/users/${id}`,
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
 * Get user deleted products request
 */
async function getDeletedProducts(userId: number) {
    return new Promise(function (resolve, reject) {
        (async () => {
            let products: ProductsItem[] = [];
            const response = await fetch(
                `/api/v1/products/all/${userId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            const json = await response.json() as unknown as ProductsItem[];
            for (let product of json) {
                if (product.deleted == true) {
                    products.push(product);
                }
            }
            if (response.status === 200) {
                resolve(products);
            } else {
                reject(products);
            }
        })();
    });
}

/**
 * Get user deleted suppliers request
 */
async function getDeletedSuppliers(userId: number) {
    return new Promise(function (resolve, reject) {
        (async () => {
            let suppliers: SuppliersItem[] = [];
            const response = await fetch(
                `/api/v1/suppliers/all/${userId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            const json = await response.json() as unknown as SuppliersItem[];
            for (let supplier of json) {
                if (supplier.deleted == true) {
                    suppliers.push(supplier);
                }
            }
            if (response.status === 200) {
                resolve(suppliers);
            } else {
                reject(suppliers);
            }
        })();
    });
}

/**
 * Change the status of the product to not deleted
 * 
 * @param id 
 * @param jwt 
 */
async function RestoreProduct(id: number, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const update = {
                deleted: false
            };
            const response = await fetch(
                `/api/v1/products/${id}`,
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
 *  UnDelete supplier from database
 * 
 * @param id 
 * @param jwt 
 */
async function restoreSupplier(id: number, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const update = {
                deleted: false
            };
            const response = await fetch(
                `/api/v1/suppliers/${id}`,
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