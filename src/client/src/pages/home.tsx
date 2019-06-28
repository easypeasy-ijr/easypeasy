import React from 'react';
import { Dialog } from '../components/dialog/dialog';
import { PopUp } from '../components/popup/popup';
import Icon from './images/logo.png';
import { getAuthToken } from '../components/with_auth/with_auth';

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

interface HomeProps {
}

interface HomeState {
    user: UserItem | null
}

export class Home extends React.Component<HomeProps, HomeState> {
    public constructor(props: HomeProps) {
        super(props);
        this.state = {
            user: null,
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
                const user = await getUser(token) as UserItem;
                this.setState({user: user})
            }
        })();
    }

    public render() {
        if (this.state.user == null) {
            return [<h1>
                Home
                </h1>,
            <div >
                <h2>Welcome to The EasyPeasy Web App!!</h2>
                <img className="image_icon_big" src={Icon} alt="delete"></img>
            </div>
            ];
        } else {
            return [<h1>
                Home
                </h1>,
            <div >
                <h2>Hello <label className="label">{this.state.user.contactName}</label>, Welcome to EasyPeasy's Web App!!</h2>
                <img className="image_icon_big" src={Icon} alt="delete"></img>
            </div>
            ];
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

