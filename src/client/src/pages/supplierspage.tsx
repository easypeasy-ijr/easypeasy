import React from 'react';
import { Dialog } from '../components/dialog/dialog';
import Delete from './images/delete.png';
import { setAuthToken, getAuthToken } from '../components/with_auth/with_auth';
import * as H from 'history';
import { PopUp } from '../components/popup/popup';
import * as joi from "joi";

/**
 * validation schema for emails
 */
const credentialSchema = {
    email: joi.string().email().required()
};

/**
 * validation schema for emails
 */
const credentialSchemaQty = {
    productUnit: joi.string().required()
};

/**
 * dialog form holder
 */
const formHolder: React.CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    fontFamily: `Rubik,Lato,"Lucida Grande","Lucida Sans Unicode",Tahoma,Sans-Serif`,
    fontSize: "10px"
};

const deleteMessage: React.CSSProperties = {
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


interface ProductsItem {
    id: number;
    user: UserItem;
    supplier: SuppliersItem;
    name: string;
    unit: string;
}

interface OrdersItem {
    id: number;
    user: UserItem;
    date: string;
    products: ProductsItem[];
    suppliers: SuppliersItem[];
    confirmed: boolean;
    favourite: string;
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


interface SuppliersPageProps {
    history: H.History;
}

interface SuppliersPageState {
    user: UserItem | null;
    currentSupplier: SuppliersItem | null;
    currentProduct: ProductsItem | null;
    addProduct: boolean | null;
    deleteProduct: boolean | null;
    productName: string;
    productUnit: string;
    addSupplier: boolean | null;
    deleteSupplier: boolean | null;
    companyEmail: string;
    companyContactName: string;
    companyName: string;
    companyPhone: string;
    Suppliers: SuppliersItem[] | null;
    querySupplier: string;
    queryProduct: string;
    changeEmail: boolean | null;
    changeName: boolean | null;
    message: boolean | null;
    title: string | null;
    messageContent: string | null;
    token: string | null;
    error: string | null;
}

export class SuppliersPage extends React.Component<SuppliersPageProps, SuppliersPageState> {
    public constructor(props: SuppliersPageProps) {
        super(props);
        this.state = {
            user: null,
            currentSupplier: null,
            currentProduct: null,
            addProduct: false,
            deleteProduct: false,
            productName: "",
            productUnit: "",
            addSupplier: false,
            deleteSupplier: false,
            companyEmail: "",
            companyContactName: "",
            companyName: "",
            companyPhone: "",
            Suppliers: null,
            querySupplier: "",
            queryProduct: "",
            message: false,
            title: "",
            messageContent: "",
            changeEmail: null,
            changeName: null,
            token: null,
            error: null
        };
    }

    /**
     * Before component renders get user from token
     * get its infro from id
     * get full info of suppliers
     */
    public componentWillMount() {
        (async () => {
            const token = getAuthToken();
            if (token) {
                this.setState({ token: token });
                const user = await getUser(token) as UserItem;
                if (user) {
                    this.setState({ user: user });
                    this.setState({ Suppliers: user.suppliers });
                }
            }
        })();
    }

    public render() {
        if (this.state.Suppliers === null) {
            return <h1>Loading...</h1>;
        } else {
            return [<h1>
                Suppliers
                </h1>,

            <div>
                {this._showSupplierSearchBox()}
                {this._showProductSearchBox()}
                {this._showProductsOptions()}
                {this._showSupplierOptions()}
                {this._showAddProduct()}
                {this._showDeleteProduct()}
                {this._showAddSupplier()}
                {this._showDeleteSupplier()}
                {this._showMessage()}
                {this._showChangeEmail()}
                {this._showChangeName()}
            </div>,
            ];

        }
    }

    /**
     * 
     * Product state changes methods
     * 
     */
    /**
     *  Change current product to the one selected
     */
    private _selectProduct(product: ProductsItem) {
        this.setState({ currentProduct: product });
        this.setState({ changeEmail: false });
        this.setState({ changeName: false });
    }
    /**
     *  Change add product state to true 
     */
    private _selectAddProduct(bool: boolean) {
        this.setState({ addProduct: bool });
    }

    /**
     *  Change delete product state to true
     */
    private _selectDeleteProduct() {
        this.setState({ deleteProduct: true });
    }

    // Update the state (ProductName) on keyup
    private _updateProductName(name: string) {
        this.setState({ productName: name });
    }
    // Update the state (ProductType) on keyup
    private _updateProductUnit(unit: string) {
        this.setState({ productUnit: unit });
    }

    /**
     * Supplier state changes methods
     * 
     */

    /**
     *  Change current supplier to the one selected
     *  if suppier or product is selected set them null
     */
    private _selectSupplier(supplier: SuppliersItem) {
        if (this.state.currentSupplier && this.state.currentProduct) {
            this.setState({ currentSupplier: null });
            this.setState({ currentProduct: null });
            this.setState({ changeEmail: false });
            this.setState({ changeName: false });
        } else if (this.state.currentSupplier) {
            this.setState({ currentSupplier: null });
            this.setState({ changeEmail: false });
            this.setState({ changeName: false });
        } else {
            this.setState({ currentSupplier: supplier });
        }
    }

    /**
     *  Change add supplier state to true 
     */
    private _selectAddSupplier(bool: boolean) {
        this.setState({ addSupplier: bool });
    }

    /**
     *  Change delete supplier state to true 
     */
    private _selectDeleteSupplier(bool: boolean) {
        this.setState({ deleteSupplier: bool });
    }

    // Update the state (CompanyName) on keyup
    private _updateCompanyName(name: string) {
        this.setState({ companyName: name });
    }
    // Update the state (ProductType) on keyup
    private _updateContactName(name: string) {
        this.setState({ companyContactName: name });
    }

    // Update the state (ProductName) on keyup
    private _updateCompanyEmail(email: string) {
        this.setState({ companyEmail: email });
    }

    // Update the state (ProductType) on keyup
    private _updateCompanyPhone(number: string) {
        this.setState({ companyPhone: number });
    }

    // Update message status
    private _updateMessageStatus() {
        this.setState({ message: true });
    }

    /**
     *  Change open state of adding product
     */
    private _cancelAddProduct() {
        this.setState({ addProduct: false });
    }
    /**
     *  Change open state of deleting product
     */
    private _cancelDeleteProduct() {
        this.setState({ deleteProduct: false });
    }
    /**
     *  Change open state of adding supplier
     */
    private _cancelAddSupplier() {
        this.setState({ addSupplier: false });
    }
    /**
     *  Change open state of deleting supplier
     */
    private _cancelDeleteSupplier() {
        this.setState({ deleteSupplier: false });
    }

    /**
     * Show Suppliers search box
     */
    private _showSupplierSearchBox() {
        if (this.state.Suppliers) {
            console.log(this.state.Suppliers);
            const filteredSuppliers = this.state.Suppliers.filter((supplier) => {
                return supplier.companyName.toLocaleLowerCase().indexOf(this.state.querySupplier) !== -1;
            });
            return <div>
                <input
                    className="search_suppliers"
                    placeholder="Search by Name"
                    type="text"
                    onKeyUp={(e) => this._onSupplierSearch(e.currentTarget.value)}
                />
                {this._showSuppliers(filteredSuppliers)}
            </div>
        }
    }

    private _onSupplierSearch(query: string) {
        this.setState({ querySupplier: query.toLocaleLowerCase() });
    }

    private _showSuppliers(list: SuppliersItem[]) {
        return <div className="center_list_suppliers">
            <div className="display_buttons">
                <button className="header_button">Supplier</button>
                <button className="header_button">Phone</button>
                <button className="header_button">Email</button>
            </div>
            {
                list.map((supplier, supplierIndex) => {
                    return [<div className="display_buttons" key={supplierIndex} onClick={() => this._selectSupplier(supplier)}>
                        <button className="item_button" >{supplier.companyName}</button>
                        <button className="item_button">{supplier.phoneNumber}</button>
                        <button className="break_item_button">{supplier.email}</button>
                    </div>];
                })
            }
        </div >
    }

    /**
     * Show Products search box
     */
    private _showProductSearchBox() {
        if (this.state.currentSupplier && this.state.currentSupplier.products) {
            const filteredProducts = this.state.currentSupplier.products.filter((product) => {
                return product.name.toLocaleLowerCase().indexOf(this.state.queryProduct) !== -1;
            });
            return <div>
                <div>
                    <div>
                        <input
                            className="suppliers_product_search"
                            placeholder="Search by Name"
                            type="text"
                            onKeyUp={(e) => this._onProductSearch(e.currentTarget.value)}
                        />
                    </div>
                    {this._showProducts(filteredProducts)}
                </div>
            </div>
        }
    }

    private _onProductSearch(query: string) {
        this.setState({ queryProduct: query.toLocaleLowerCase() });
    }

    private _showProducts(list: ProductsItem[]) {
        if (this.state.currentSupplier) {
            return <div className="suppliers_products">
                <button className="header_button">{this.state.currentSupplier.companyName}</button>
                {list.map((product, index) => {
                    return <div key={index}><button onClick={() => this._selectProduct(product)} className="item_button" >{product.name}</button>
                    </div>;
                })}
            </div>
        }
    }

    /**
     * Show product options
     */
    private _showProductsOptions() {
        if (this.state.currentProduct && this.state.currentSupplier) {
            return <div className="settings_list_header_supplier">
                <button className="header_button">{this.state.currentProduct.name}</button>
                <button onClick={() => this._selectDeleteProduct()} className="item_button">Delete?</button>
            </div>;
        }
    }

    /**
     * Show supplier options
     */
    private _showSupplierOptions() {
        if (!this.state.currentProduct && !this.state.currentSupplier) {
            return <ul className="suppliers_options">
                <button onClick={() => this._selectAddSupplier(true)} className="item_button">Add Supplier</button>
            </ul>;
        } else if (this.state.currentSupplier) {
            return <ul className="suppliers_options">
                <button onClick={() => this._selectAddSupplier(true)} className="item_button">Add Supplier</button>
                <button className="header_button">{this.state.currentSupplier.companyName}</button>
                <button onClick={() => this._selectAddProduct(true)} className="item_button">Add Product</button>
                <button onClick={() => this._selectChangeName(true)} className="item_button">Change Name </button>
                <button onClick={() => this._selectChangeEmail(true)} className="item_button">Change Email </button>
                <button onClick={() => this._selectDeleteSupplier(true)} className="item_button">Delete</button>
            </ul>;
        }
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
    /*************************************************************************************
     * 
     *  CODE RELATED TO CHANGING SUPPLIER COMPANY NAME
     * 
     **************************************************************************************/

    /**
     *  Change email change state to true or false
     */
    private _selectChangeName(bool: boolean) {
        this.setState({ changeName: bool });
    }

    /**
     * Show change email component depending on state
     */
    private _showChangeName() {
        if (this.state.changeName == true) {
            return <Dialog
                title={"Change Name"}
                body={<div >
                    <div className="small_Form_Input_Dialog">
                        New Company Name
                <input

                            type="text"
                            placeholder="New name"
                            onKeyUp={(e) => this._updateCompanyName((e as any).target.value)}
                        />
                    </div>
                </div>}
                cancel={<button className="item_button" onClick={() => this._selectChangeName(false)}>Cancel</button>}
                submit={<button className="item_button" onClick={() => this._handleChangeName()}>ok</button>}
            >
            </Dialog>
        }
    }

    /**
     * Handle change supplier's email
     */
    private _handleChangeName() {
        (async () => {
            try {
                //update message
                this._setMessage("Changing Name", "Name Changed");
                //if user is logged in and new email is set
                if (this.state.token && this.state.companyName && this.state.user && this.state.currentSupplier) {
                    // Reset error
                    this.setState({ error: null });
                    const supplier = await changeName(this.state.currentSupplier.id, this.state.companyName, this.state.token);
                    //update popup and dialog
                    this._openPopup(true);
                    this._selectChangeName(false);
                    /**
                     * Update states
                     */
                    let currentSuppliers = this.state.Suppliers;
                    let currentSupplier = this.state.currentSupplier;
                    /**
                     * remove current supplier from list
                     * to modify it and add it again
                     */
                    if (currentSuppliers) {
                        const index = currentSuppliers.indexOf(currentSupplier, 0);
                        if (index > -1) {
                            currentSuppliers.splice(index, 1);
                        }
                    }
                    currentSupplier.companyName = this.state.companyName;
                    if (currentSuppliers) {
                        currentSuppliers.push(currentSupplier);
                    }
                    this.setState({ Suppliers: currentSuppliers });
                    this._selectChangeName(false);
                    this._updateMessageStatus();
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    /*************************************************************************************
     * 
     *  CODE RELATED TO CHANGING SUPPLIER EMAIL
     * 
     **************************************************************************************/

    /**
     *  Change email change state to true or false
     */
    private _selectChangeEmail(bool: boolean) {
        this.setState({ changeEmail: bool });
    }

    /**
     * Show change email component depending on state
     */
    private _showChangeEmail() {
        if (this.state.changeEmail == true) {
            return <Dialog
                title={"Change Email"}
                body={<div >
                    <div >{this._renderValidationErrors()}</div>
                    <div className="small_Form_Input_Dialog">
                        New Email
                <input

                            type="text"
                            placeholder="New email"
                            onKeyUp={(e) => this._updateCompanyEmail((e as any).target.value)}
                        />
                    </div>
                </div>}
                cancel={<button className="item_button" onClick={() => this._selectChangeEmail(false)}>Cancel</button>}
                submit={<button className="item_button" onClick={() => this._handleChangeEmail()}>ok</button>}
            >
            </Dialog>
        }
    }

    // Display Email errors or OK on screen
    private _renderValidationErrors() {
        const validationResult = joi.validate({
            email: this.state.companyEmail
        }, credentialSchema);
        if (validationResult.error) {
            return <div className="error-msg">
                {validationResult.error.details.map(d => <div>{d.message}</div>)}
            </div>;
        } else {
            return <div className="success-msg">OK!</div>;
        }
    }

    // Display Qty errors or OK on screen
    private _renderValidationErrorsQty() {
        const validationResult = joi.validate({
            productUnit: this.state.productUnit
        }, credentialSchemaQty);
        if (validationResult.error) {
            return <div className="error-msg">
                {validationResult.error.details.map(d => <div>{d.message}</div>)}
            </div>;
        } else {
            return <div className="success-msg">OK!</div>;
        }
    }
    /**
     * Handle change supplier's email
     */
    private _handleChangeEmail() {
        (async () => {
            try {
                //update message
                this._setMessage("Changing Email", "Email Changed");
                //if user is logged in and new email is set
                if (this.state.token && this.state.companyEmail && this.state.user && this.state.currentSupplier) {
                    // Reset error
                    this.setState({ error: null });
                    const supplier = await changeEmail(this.state.currentSupplier.id, this.state.companyEmail, this.state.token);
                    //update popup and dialog
                    this._openPopup(true);
                    this._selectChangeEmail(false);
                    /**
                     * Update states
                     */
                    let currentSuppliers = this.state.Suppliers;
                    let currentSupplier = this.state.currentSupplier;
                    /**
                     * remove current supplier from list
                     * to modify it and add it again
                     */
                    if (currentSuppliers) {
                        const index = currentSuppliers.indexOf(currentSupplier, 0);
                        if (index > -1) {
                            currentSuppliers.splice(index, 1);
                        }
                    }
                    currentSupplier.email = this.state.companyEmail;
                    if (currentSuppliers) {
                        currentSuppliers.push(currentSupplier);
                    }
                    this.setState({ Suppliers: currentSuppliers });
                    this._selectChangeEmail(false);
                    this._updateMessageStatus();
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }


    // Send HTTP request (add product to supplier)on click
    private _handleAddProduct() {
        (async () => {
            try {
                //update message
                this._setMessage("Adding Product", "Product Added");
                const token = getAuthToken();

                let productToAdd: ProductsItem;


                if (token && this.state.productName && this.state.productUnit && this.state.currentSupplier) {
                    // Reset error
                    this.setState({ error: null });
                    const product = await createProduct(this.state.productName, this.state.productUnit, this.state.currentSupplier.id, token) as unknown as ProductsItem;
                    /**
                     * Update states
                     */
                    productToAdd = product;
                    let currentSuppliers = this.state.Suppliers;
                    let currentSupplier = this.state.currentSupplier;
                    /**
                     * remove current supplier from list
                     * to modify it and add it again
                     */
                    if (currentSuppliers) {
                        const index = currentSuppliers.indexOf(currentSupplier, 0);
                        if (index > -1) {
                            currentSuppliers.splice(index, 1);
                        }
                    }
                    let currentSupplierProducts = currentSupplier.products;
                    currentSupplierProducts.push(productToAdd);
                    currentSupplier.products = currentSupplierProducts;
                    if (currentSuppliers) {
                        currentSuppliers.push(currentSupplier);
                    }
                    this.setState({ Suppliers: currentSuppliers });
                    this._updateMessageStatus();
                    this._selectAddProduct(false);
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    // Send HTTP request (delete product)on click
    private _handleDeleteProduct() {
        (async () => {
            try {
                //update message
                this._setMessage("Deleting Product", "Product Deleted");
                const token = getAuthToken();
                if (token && this.state.currentProduct && this.state.currentSupplier) {
                    // Reset error
                    this.setState({ error: null });
                    const product = await deleteProduct(this.state.currentProduct.id, token) as unknown as ProductsItem;
                    /**
                     * Update states
                     */
                    let currentSuppliers = this.state.Suppliers;
                    let currentSupplier = this.state.currentSupplier;
                    /**
                     * remove current supplier from list
                     * to modify it and add it again
                     */
                    if (currentSuppliers) {
                        const index = currentSuppliers.indexOf(currentSupplier, 0);
                        if (index > -1) {
                            currentSuppliers.splice(index, 1);
                        }
                    }
                    let currentSupplierProducts = currentSupplier.products;
                    let index = currentSupplierProducts.findIndex(x => x.id == product.id)
                    // here you can check specific property for an object whether it exist in your array or not
                    if (index > -1) {
                        currentSupplierProducts.splice(index, 1)
                    }
                    //Re asign the updated list
                    currentSupplier.products = currentSupplierProducts;
                    if (currentSuppliers) {
                        currentSuppliers.push(currentSupplier);
                    }
                    this.setState({ Suppliers: currentSuppliers });
                    this._selectAddProduct(false);
                    this._cancelDeleteProduct();
                    this._updateMessageStatus();
                    this.setState({ currentProduct: null });
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    // Send HTTP request (add supplier to database)on click
    private _handleAddSupplier() {
        (async () => {
            try {
                //update message
                this._setMessage("Adding Supplier", "Supplier Added");
                const token = getAuthToken();
                if (token && this.state.companyEmail && this.state.companyName && this.state.companyContactName
                    && this.state.companyPhone) {
                    // Reset errotState({ error: null });

                    let supplierToAdd: SuppliersItem;

                    const supplier = await createSupplier(this.state.companyEmail,
                        this.state.companyContactName, this.state.companyName,
                        this.state.companyPhone, token) as unknown as SuppliersItem;
                    /**
                     * Update states
                     */
                    supplierToAdd = supplier;
                    supplierToAdd.products = [];
                    let currentSuppliers = this.state.Suppliers;
                    if (currentSuppliers) {
                        currentSuppliers.push(supplierToAdd);
                    }
                    this.setState({ Suppliers: currentSuppliers });
                    this._selectAddSupplier(false);
                    this._updateMessageStatus();
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    // Send HTTP request (delete supplier)on click
    private _handleDeleteSupplier() {
        (async () => {
            try {
                //update message
                this._setMessage("Deleting Supplier", "Supplier Removed");
                const token = getAuthToken();
                if (token && this.state.currentSupplier) {
                    // Reset error
                    this.setState({ error: null });

                    const supplier = await deleteSupplier(this.state.currentSupplier.id, token) as unknown as SuppliersItem;
                    const products = await deleteProducts(this.state.currentSupplier.id, token);
                    /**
                     * Update states
                     */
                    let currentSuppliers = this.state.Suppliers;
                    /**
                     * remove current supplier from list
                     */
                    if (currentSuppliers) {
                        let index = currentSuppliers.findIndex(x => x.id == supplier.id)
                        // here you can check specific property for an object whether it exist in your array or not
                        if (index > -1) {
                            currentSuppliers.splice(index, 1)
                        }
                    }
                    /**
                     * assign list to current suppliers list state
                     */
                    this.setState({ Suppliers: currentSuppliers });
                    this.setState({ currentSupplier: null });
                    this._selectDeleteSupplier(false);
                    this._updateMessageStatus();
                }
            } catch (err) {
                this.setState({ error: err.error });
            }
        })();
    }

    /**
     * Show add product dialog
     */
    private _showAddProduct() {
        if (this.state.addProduct == true) {
            return <Dialog
                title={"Add product"}
                body={<div className="small_dialog_content_form">
                    {this._renderValidationErrorsQty()}
                    <div className="x_Form_Input_Dialog">
                        Name:
                <input
                            type="text"
                            placeholder="ProductName"
                            onKeyUp={(e) => this._updateProductName((e as any).target.value)}
                        />
                    </div>
                    <div className="x_Form_Input_Dialog">
                        Unit:
                <input
                            type="text"
                            placeholder="ProductUnit"
                            onKeyUp={(e) => this._updateProductUnit((e as any).target.value)}
                        />
                    </div>
                </div>}
                cancel={<button className="item_button" onClick={() => this._cancelAddProduct()}>Cancel</button>}
                submit={<button className="item_button" onClick={() => this._handleAddProduct()}>Add</button>}
            >
            </Dialog>
        } else {
            return
        }
    }

    /**
     * Show delete product dialog
     */
    private _showDeleteProduct() {
        if (this.state.deleteProduct == true) {
            return <Dialog
                title={"Delete product"}
                body={<div style={formHolder}>
                    <div style={deleteMessage}>
                        Are you sure you want to delete this product?
                    </div>
                </div>}
                cancel={<button className="item_button" onClick={() => this._cancelDeleteProduct()}>Cancel</button>}
                submit={<button className="item_button" onClick={() => this._handleDeleteProduct()}>Delete</button>}
            >
            </Dialog>
        } else {
            return
        }
    }

    /**
     * Show add supplier dialog
     */
    private _showAddSupplier() {
        if (this.state.addSupplier == true) {
            return <Dialog
                title={"Add Supplier"}
                body={<div className="big_dialog_content_form">
                    {this._renderValidationErrors()}
                    <div className="smaller_Form_Input_Dialog">
                        Company Name:
                <input
                            type="text"
                            placeholder="CompanyName"
                            onKeyUp={(e) => this._updateCompanyName((e as any).target.value)}
                        />
                    </div>
                    <div className="smaller_Form_Input_Dialog">
                        Contact Name:
                <input
                            type="text"
                            placeholder="ContactName"
                            onKeyUp={(e) => this._updateContactName((e as any).target.value)}
                        />
                    </div>
                    <div className="smaller_Form_Input_Dialog">
                        Email:
                <input
                            type="text"
                            placeholder="CompanyEmail"
                            onKeyUp={(e) => this._updateCompanyEmail((e as any).target.value)}
                        />
                    </div>
                    <div className="smaller_Form_Input_Dialog">
                        Phone Number:
                <input
                            type="text"
                            placeholder="CompanyPhone"
                            onKeyUp={(e) => this._updateCompanyPhone((e as any).target.value)}
                        />
                    </div>
                </div>}

                cancel={<button className="item_button" onClick={() => this._cancelAddSupplier()}>Cancel</button>}
                submit={<button className="item_button" onClick={() => this._handleAddSupplier()}>Add</button>}
            >
            </Dialog>
        } else {
            return
        }
    }

    /**
     * Show delete product dialog
     */
    private _showDeleteSupplier() {
        if (this.state.deleteSupplier == true) {
            return <Dialog
                title={"Delete Supplier"}
                body={<div style={formHolder}>
                    <div style={deleteMessage}>
                        Are you sure you want to delete this supplier?
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
}

/**
 * Get suppliers products token
 */
async function deleteProducts(supplierId: number, jwt: string) {
    return new Promise(function (resolve, reject) {
        (async () => {

            const response = await fetch(
                `/api/v1/products/supplier/${supplierId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            const json = await response.json() as ProductsItem[];
            for (let product of json) {
                const products = await deleteProduct(product.id, jwt);
            }
            if (response.status === 200) {
                resolve(json);
            } else {
                reject(json);
            }
        })();
    });
}

/**
 * Get user using token
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
 * 
 * Add product to database
 * 
 * @param name 
 * @param type 
 * @param supplierId 
 * @param jwt 
 */
async function createProduct(name: string, unit: string, supplierId: number, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const data = {
                name: name,
                unit: unit
            };
            const response = await fetch(
                `/api/v1/products/${supplierId}`,
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
 * Change the status of the product to deleted
 * 
 * @param id 
 * @param jwt 
 */
async function deleteProduct(id: number, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const update = {
                deleted: true
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
 * Add supplier to database
 * 
 * @param email 
 * @param contactName 
 * @param companyName 
 * @param phoneNumber 
 */
async function createSupplier(email: string, contactName: string, companyName: string, phoneNumber: string, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const data = {
                email: email,
                contactName: contactName,
                companyName: companyName,
                phoneNumber: phoneNumber
            };
            const response = await fetch(
                "/api/v1/suppliers",
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
 * "Delete" supplier from database
 * 
 * @param id 
 * @param jwt 
 */
async function deleteSupplier(id: number, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const update = {
                deleted: true
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

/**
 * Change Supplier Email
 * 
 * @param id 
 * @param jwt 
 */
async function changeEmail(id: number, email: string, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const update = {
                email: email
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

/**
 * Change Supplier company name
 * 
 * @param id 
 * @param jwt 
 */
async function changeName(id: number, name: string, jwt: string) {
    return new Promise<string>(function (resolve, reject) {
        (async () => {
            const update = {
                companyName: name
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




