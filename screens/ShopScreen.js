// ShopScreen.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, BackHandler, ScrollView, Image, TextInput, Pressable, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import Animated from 'react-native-reanimated';
import { 
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import Modal from 'react-native-modal';
import { account, databases } from '../lib/appwrite';
import { moderateScale, verticalScale, scale } from 'react-native-size-matters';
import Oval from '../components/Oval';
import ExitIcon2 from '../assets/icons/ExitIcon2.svg';
import Barcode from 'react-native-barcode-svg';
// import SecureStore etc. if you still need it
import * as SecureStore from 'expo-secure-store';
import { commonStyles } from '../lib/styles';
import WPlus from '../assets/icons/WPlus.svg';
import CartIcon from '../assets/icons/CartIcon.svg';
import SearchIcon from '../assets/icons/SearchIcon.svg';
import ExpandIcon3 from '../assets/icons/ExpandIcon3.svg';
import PiggyBank from '../assets/icons/PiggyBank.svg';
import MoneyFlip2 from '../assets/icons/MoneyFlip2.svg';
import Location from '../assets/icons/Location.svg';
import Globe from '../assets/icons/Globe.svg';
import Settings from '../assets/icons/Settings.svg';
import WPlus3 from '../assets/icons/WPlus3.svg';
import WPlus2 from '../assets/icons/WPlus2.svg';
import ScannerIcon2 from '../assets/icons/ScannerIcon2.svg';
import { createRandomMaleFirstName } from '../lib/createRandomName.js';
import ShopFilled from '../assets/icons/ShopFilled.svg';
import ItemsOutline from '../assets/icons/ItemsOutline.svg';
import Sparky from '../assets/icons/Sparky.svg';
import ServicesOutline from '../assets/icons/ServicesOutline.svg';
import AccountOutline from '../assets/icons/AccountOutline.svg';
import CoronaM from '../components/Maps/CoronaM.svg';
import { checkRecentOrderExpiration } from '../lib/recentOrder.js'; 
import { registerPushTokenForUser } from '../lib/notifications';
import Scatter from '../assets/icons/Scatter.svg';
import * as Device from 'expo-device';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import messaging from '@react-native-firebase/messaging';
import { Client, Messaging, Databases, ID, Permission, Account } from "react-native-appwrite";

const SHOP_URL = 'https://www.walmart.com'; // <-- put your target URL here

const replacementHTML = `
<div data-testid="layout-container" class="flex flex-column min-vh-100 shadow-2" style="transform:none;transition:transform .2s"><span data-testid="global-header" class="bg-secondary w-100 top-0 z-1 sticky" style="transition:top 0.65s" data-dca-id="M:3E76E52F7C" data-dca-type="module"><a link-identifier="Generic Name" class="o-0 absolute" tabindex="-1" data-dca-id="L:CDF8623A25"></a><a link-identifier="Generic Name" class="slider skip-main bg-white-90" data-dca-id="L:E76549B6E8" href="#maincontent">Skip to Main Content</a><header class="flex items-center justify-center pa3 center-hdkp ph4-hdkp pv3-hdkp" data-testid="responsiveHeader" data-dca-id="ui_global_header:responsive_header" data-dca-name="UiGlobalHeaderResponsiveHeaderPrimary" data-dca-type="module"><nav aria-label="Cart"><ul class="flex ma0 pa0 list" style="height:52px"><li class="dn db-hdkp ml3 relative"><a link-identifier="Reorder my items" class="flex items-center no-underline desktop-header-trigger lh-title lh-solid redesign-nav-v2 white hover-bg-navy" style="border-radius:32px;height:52px;transition:all 100ms cubic-bezier(0.77, 0, 0.175, 1)" aria-haspopup="true" aria-expanded="false" data-dca-name="Reorder my items" role="button" data-dca-id="L:87A208F9E9" href="/my-items"><i class="ld ld-Heart pr2" style="font-size:1rem;vertical-align:-0.175em;width:16px;height:1rem;box-sizing:content-box" aria-hidden="true"></i><div class="nowrap"><div class="lh-title f6" style="height:20px">Reorder</div><div class="b f5 lh-copy" style="margin-top:-4px">My Items</div></div></a><div class="absolute bg-white br3 br--bottom left-0 lh-copy mt3 shadow-1 z-1 dn" data-testid="my-items-flyout" style="margin-top:16px;left:50%;transform:translateX(-50%)"><div class="ph4 pt4 pb2" data-automation-id="walmart-myitems"><a link-identifier="Reorder" class="dark-gray db f6 no-underline nowrap desktop-header-flyout-link mb3" data-automation-id="walmart-reorder" data-dca-name="Reorder" data-dca-id="L:7653D2EA57" href="/my-items"><i class="ld ld-Reorder mr2" style="font-size:1rem;vertical-align:-0.175em;width:1rem;height:1rem;box-sizing:content-box"></i>Reorder</a><a link-identifier="Lists" class="dark-gray db f6 no-underline nowrap desktop-header-flyout-link mb3" data-automation-id="walmart-list" data-dca-name="Lists" data-dca-id="L:B07B7ACD2B" href="/lists"><i class="ld ld-Heart mr2" style="font-size:1rem;vertical-align:-0.175em;width:1rem;height:1rem;box-sizing:content-box"></i>Lists</a><a link-identifier="Registries" class="dark-gray db f6 no-underline nowrap desktop-header-flyout-link mb3" data-dca-name="Registries" data-dca-id="L:EA8D9512A2" href="/my-registries"><i class="ld ld-Gift mr2" style="font-size:1rem;vertical-align:-0.175em;width:1rem;height:1rem;box-sizing:content-box"></i>Registries</a></div></div></li><li class="dn db-hdkp ml2 relative"><span class="dib relative w_cWnn br3" style="display: inline;"><div><a link-identifier="Account" class="flex items-center no-underline desktop-header-trigger lh-title lh-solid redesign-nav-v2 white hover-bg-navy" aria-haspopup="true" aria-expanded="false" data-dca-name="Account" role="button" data-dca-id="L:87A208F9E9" href="/account" style="border-radius: 32px; height: 52px; transition: 100ms cubic-bezier(0.77, 0, 0.175, 1);"><i class="ld ld-User" aria-hidden="true" style="font-size: 16px; vertical-align: -0.175em; width: 16px; height: 16px; box-sizing: content-box;"></i><div class="ml2 nowrap"><div class="mw3 mw4-hdkp truncate lh-copy f6" data-testid="logged-in-account-button-name" data-qm-mask="true" data-sensitivity="medium" style="height: 20px;">Hi, Jarid D</div><div class="b lh-copy h2 f5" style="margin-top: -4px;">Account</div></div></a><div class="absolute bg-white br3 br--bottom left-0 lh-copy mt3 shadow-1 z-1 dn" data-testid="account-flyout" style="margin-top: 16px; left: 50%; transform: translateX(-50%);"><div class="flex flex-row-reverse"><div class="pa4"><a link-identifier="Purchase History" class="dark-gray db f6 no-underline nowrap desktop-header-flyout-link mb3" data-dca-name="Purchase History" data-dca-id="L:F9B257AA2E" href="/orders"><i class="ld ld-Receipt mr2" style="font-size: 1rem; vertical-align: -0.175em; width: 1rem; height: 1rem; box-sizing: content-box;"></i>Purchase History</a><a link-identifier="Account" class="dark-gray db f6 no-underline nowrap desktop-header-flyout-link mb3 relative" aria-label="Account" data-dca-id="L:1C9324DE10" href="/account"><i class="ld ld-User mr2" style="font-size: 1rem; vertical-align: -0.175em; width: 1rem; height: 1rem; box-sizing: content-box;"></i>Account</a><a link-identifier="Subscription" class="dark-gray db f6 no-underline nowrap desktop-header-flyout-link mb3 mt3" data-automation-id="subscription" data-dca-id="L:B09B7C822E" href="/subscriptions/manage"><i class="ld ld-Subscription mr2" aria-hidden="true" style="font-size: 1rem; vertical-align: -0.175em; width: 1rem; height: 1rem; box-sizing: content-box;"></i>Subscriptions</a><div class="mt3 mb1"><hr aria-hidden="true" class="w_8Gn9"></div><button type="button" class="h4 b--none bn bg-transparent lh-copy mid-gray relative sans-serif tl w-100 pa0 f6 dark-gray db no-underline nowrap" aria-expanded="false" data-dca-id="B:0E4D1F1C3D" data-dca-intent="__DCA_TBD__"><i class="ld ld-Globe mr2" style="font-size: 1rem; vertical-align: -0.175em; width: 1rem; height: 1rem; box-sizing: content-box;"></i>Language | English</button><div class="mb3 mt1"><hr aria-hidden="true" class="w_8Gn9"></div><a link-identifier="Generic Name" class="dark-gray db f6 no-underline nowrap desktop-header-flyout-link" data-dca-name="SignOut" data-dca-id="L:92FAF7868E" href="https://www.walmart.com/account/logout?returnUrl=%2F"><i class="ld ld-SignOut mr2" style="font-size: 1rem; vertical-align: -0.175em; width: 1rem; height: 1rem; box-sizing: content-box;"></i>Sign Out</a></div></div></div></div></span></li></ul></nav></header></span><div class="flex flex-column flex-auto relative z-0" aria-hidden="false"><div class="bg-primary white sticky z-3 gic-wrapper gic-wrapper-redesign-top layout-gic-wrapper" id="gic-wrapper" data-testid="gic-wrapper" style="min-height:41px;transition:top 0.65s"><hr aria-hidden="true" class="w_8Gn9 banner-divider redesign"><div data-testid="global-intent-center" data-dca-type="module" data-dca-name="globalIntentCenter"><div class="center items-center flex flex-auto ph3 ph4-m pv1 f6 gic-banner" id="intent-banner-section" style="line-height: 2;"><button class="w_hhLG w_DZvO w_0_LY pa0 no-underline flex-auto flex-none-m w-100 w-auto-m white hover-white w-100 w-auto-m" type="button" data-automation-id="fulfillment-banner" tabindex="0" aria-expanded="false" data-dca-id="B:7D5012E64D" data-dca-intent="__DCA_TBD__"><div class="flex items-center content-start flex-auto flex-none-m"><div class="flex items-center truncate fl" style="width: 867px;"><img loading="lazy" alt="" src="https://i5.walmartimages.com/dfw/4ff9c6c9-ad46/k2-_0a671c38-d307-447c-835e-7904ab143c26.v1.png" width="26" height="26" aria-hidden="true" class="mr2 br-100 v-btm"><span class="f6 pointer flex" style="margin: auto;"><span class="dn b">Pickup or delivery?</span><span class="b">Pickup or delivery?</span></span><div class="db-m truncate w-100"><div class="flex items-center w-100"><span data-sensitivity="medium" class="mw-none-m mh2-m truncate tr pl4 ml-auto" data-qm-mask="true">184 Palmyra Dr, San Bernardino</span></div></div></div></div><i class="ld ld-ChevronDown ml2 dn-m db" style="font-size: 1rem; vertical-align: -0.175em; width: 1rem; height: 1rem; box-sizing: content-box;"></i></button><span class="w_iUH7"></span><section data-testid="global-intent-center-banner" data-dca-id="M:00FF97383D" data-dca-type="module"><div class="br3 br--bottom bg-primary dn absolute z-3 br4 gic-drawer left-0 pb3 pt4 ph4-m" role="dialog" aria-label="Pickup or delivery?" style="top: 41px; line-height: normal;"><div data-no-autofocus="false"><ul class="flex justify-between bg-primary list ph6 mt0 mb3" style="gap: 20px;"><li class="relative" style="flex: 1 1 0%;"><button type="button" class="flex flex-column items-center sans-serif bg-primary b--none pointer ph0 white" data-dca-type="component" data-dca-name="Shipping" id="intent-id0" aria-pressed="false" aria-label="Shipping" data-dca-id="B:CE7A443EFE" data-dca-intent="__DCA_TBD__"><div class="pa1"><img loading="lazy" alt=" " src="https://i5.walmartimages.com/dfw/4ff9c6c9-486e/k2-_4be6f532-b0b2-4480-bb65-d53586e87193.v1.png" width="50" height="50" class="v-btm" aria-hidden="true"></div><div class="f6 mt2 b">Shipping</div></button></li><li class="relative" style="flex: 1 1 0%;"><button type="button" class="flex flex-column items-center sans-serif bg-primary b--none pointer ph0 white" data-dca-type="component" data-dca-name="Pickup" id="intent-id1" aria-pressed="false" aria-label="Pickup" data-dca-id="B:CE7A443EFE" data-dca-intent="__DCA_TBD__"><div class="pa1"><img loading="lazy" alt=" " src="https://i5.walmartimages.com/dfw/4ff9c6c9-944a/k2-_333618e2-7327-4081-990e-7870dd062248.v1.png" width="50" height="50" class="v-btm" aria-hidden="true"></div><div class="f6 mt2 b">Pickup</div></button></li><li class="relative" style="flex: 1 1 0%;"><button type="button" class="flex flex-column items-center sans-serif bg-primary b--none pointer ph0 white" data-dca-type="component" data-dca-name="Delivery" id="intent-id2" aria-pressed="false" aria-label="Delivery" data-dca-id="B:CE7A443EFE" data-dca-intent="__DCA_TBD__"><div class="pa1"><img loading="lazy" alt=" " src="https://i5.walmartimages.com/dfw/4ff9c6c9-4637/k2-_c8d39665-dac4-474a-9fb7-ab5feeb647b5.v1.png" width="50" height="50" class="v-btm" aria-hidden="true"></div><div class="f6 mt2 b">Delivery</div></button></li></ul><div class=""><div class=""><div class="shadow-1 br3"><div class="bg-white black br3 pa3 mb2"><div class="flex flex-column items-stretch" data-automation-id="fulfillment-address"><button class="bw0 dark-gray sans-serif flex flex-row justify-center items-stretch flex-auto tl ph0 pointer bg-white-90"><div class="flex flex-column flex-auto justify-center"><div class="flex"><div class="flex-none"><div class="flex items-center"><img loading="lazy" alt="" src="https://i5.walmartimages.com/dfw/4ff9c6c9-5249/k2-_71d3c250-050a-40b0-8fd7-c84c1df83204.v1.png" width="16" height="16"></div></div><div class="flex items-start justify-center flex-column ml2" data-qm-mask="true" data-sensitivity="medium"><div class="w_U9_0 w_U0S3 w_QcqU db lh-title"><div class="f7" data-qm-mask="true">184 Palmyra Dr, San Bernardino, CA 92404</div></div></div></div><div class="f7 flex items-center"></div></div><div class="flex items-center"><i class="ld ld-ChevronRight" aria-hidden="true" style="font-size: 1.5rem; vertical-align: -0.25em; width: 1.5rem; height: 1.5rem; box-sizing: content-box;"></i></div></button></div></div></div><div class="shadow-1 br3"><div class="bg-white black br3 pa3 mb2"><div class="flex flex-column items-stretch" data-automation-id="fulfillment-address"><button class="bw0 dark-gray sans-serif flex flex-row justify-center items-stretch flex-auto tl ph0 pointer bg-white-90"><div class="flex flex-column flex-auto justify-center"><div class="flex"><div class="flex-none"><div class="flex items-center"><img loading="lazy" alt="" src="https://i5.walmartimages.com/dfw/4ff9c6c9-14f0/k2-_8ce34043-6050-4f39-afb2-3e76a554f8a3.v1.png" width="16" height="16"></div></div><div class="flex items-start justify-center flex-column ml2" data-qm-mask="true" data-sensitivity="medium"><div class="w_kV33 w_LD4J w_mvVb db lh-title mb1"><div class="f7">Ontario Supercenter</div></div><div class="w_U9_0 w_U0S3 w_QcqU db lh-title"><div class="f7">1333 N MOUNTAIN AVE, Ontario, CA 91762</div></div></div></div><div class="f7 flex items-center"></div></div><div class="flex items-center"><i class="ld ld-ChevronRight" aria-hidden="true" style="font-size: 1.5rem; vertical-align: -0.25em; width: 1.5rem; height: 1.5rem; box-sizing: content-box;"></i></div></button></div></div></div></div></div><button type="button" class="slider skip-main bg-primary bg-transparent bn lh-solid pa0 tc underline inline-button pointer right-0 skip-btn" aria-label="Close, pickup or delivery?" data-dca-id="B:5B3CDC0E6F" data-dca-intent="__DCA_TBD__"><i class="ld ld-CloseCircleFill white" aria-hidden="true" style="font-size: 1.5rem; vertical-align: -0.25em; width: 1.5rem; height: 1.5rem; box-sizing: content-box;"></i></button><hr aria-hidden="true" class="w_8Gn9 br4 dn-m mt4 mb2 bg-white" style="width: 135px; height: 4px; margin-left: auto; margin-right: auto;"><div class="dn"></div></div></div></section></div><span class="w_iUH7" aria-hidden="true"><div class="flex items-center"><img loading="lazy" alt=" " src="https://i5.walmartimages.com/dfw/4ff9c6c9-40c5/k2-_f5224bb5-3493-47da-a046-7f816ac1730e.v1.png" width="16" height="16" aria-hidden="true" class="db-m dn"><span data-sensitivity="medium" class="mw-none-m mh2-m truncate" data-qm-mask="true">184 Palmyra Dr</span></div></span><div class="dn" data-testid="gic-dim-body" style="top: 41px;"></div></div></div><div class="flex items-center justify-between header-navigation ph4 header-navigation-mobile sticky z-2 nowrap f6 hidesb hidesb-wk overflow-x-auto overflow-y-hidden" data-testid="hearder-navigation" data-dca-type="module" data-dca-id="ui_global_header:header_navigation:module" data-dca-name="UiGlobalHeaderNavigationSecondaryHeader" style="height: 48px; top: 125px; background-color: var(--color-core-blue-20);"><div class="flex items-center w-100"><section data-dca-id="M:0971488825" data-dca-type="module"><a link-identifier="departments" class="br-pill pa2 no-underline bg-white ml3 h3" data-testid="mweb-departments-link" data-dca-id="L:6BF209D2D3"><i class="ld ld-Grid navy" aria-label="Departments" style="font-size: 1rem; vertical-align: -0.175em; width: 1rem; height: 1rem; box-sizing: content-box;"></i></a></section><section class="sub-nav-links-main-container hidesb hidesb-wk" data-testid="sub-nav-links-container" data-dca-guid="9d2b5930-6480-2bd1-8fe7-34ef34e25139" data-dca-id="M:598B42A7DF" data-dca-type="module"><nav aria-label="Secondary"><ul class="sub-nav-link-container flex-auto list pa0 ma0 h2 f6 sub-nav-link-container-mobile mr3"><li><section data-dca-id="M:2CBCC687F1" data-dca-type="module"><a link-identifier="Get it Fast" class="br-pill no-underline bg-white navy h3 ml2 dib" data-dca-name="getItFast" data-dca-id="L:7373CF4511" href="https://www.walmart.com/cp/get-it-fast/6545138" style="padding: 6px 12px;">Get it Fast</a></section></li><li><section data-dca-id="M:2CBCC687F1" data-dca-type="module"><a link-identifier="New Arrivals" class="br-pill no-underline bg-white navy h3 ml2 dib" data-dca-name="newArrivals" data-dca-id="L:7373CF4511" href="https://www.walmart.com/cp/new-arrivals/2593086" style="padding: 6px 12px;">New Arrivals</a></section></li><li><section data-dca-id="M:2CBCC687F1" data-dca-type="module"><a link-identifier="Christmas Decor" class="br-pill no-underline bg-white navy h3 ml2 dib" data-dca-name="christmasDecor" data-dca-id="L:7373CF4511" href="https://www.walmart.com/cp/7472650" style="padding: 6px 12px;">Christmas Decor</a></section></li><li><section data-dca-id="M:2CBCC687F1" data-dca-type="module"><a link-identifier="Rollbacks &amp; More" class="br-pill no-underline bg-white navy h3 ml2 dib" data-dca-name="rollbacksMore" data-dca-id="L:7373CF4511" href="https://www.walmart.com/shop/savings" style="padding: 6px 12px;">Rollbacks &amp; More</a></section></li><li><section data-dca-id="M:2CBCC687F1" data-dca-type="module"><a link-identifier="Dinner Made Easy" class="br-pill no-underline bg-white navy h3 ml2 dib" data-dca-name="dinnerMadeEasy" data-dca-id="L:7373CF4511" href="https://www.walmart.com/cp/dinner-tonight/5681029" style="padding: 6px 12px;">Dinner Made Easy</a></section></li><li><section data-dca-id="M:2CBCC687F1" data-dca-type="module"><a link-identifier="Gift Shop" class="br-pill no-underline bg-white navy h3 ml2 dib" data-dca-name="giftShop" data-dca-id="L:7373CF4511" href="https://www.walmart.com/cp/gifts/3131907" style="padding: 6px 12px;">Gift Shop</a></section></li><li><section data-dca-id="M:2CBCC687F1" data-dca-type="module"><a link-identifier="Toy Shop" class="br-pill no-underline bg-white navy h3 ml2 dib" data-dca-name="toyShop" data-dca-id="L:7373CF4511" href="https://www.walmart.com/i/toy-shop/landing" style="padding: 6px 12px;">Toy Shop</a></section></li><li><section data-dca-id="M:2CBCC687F1" data-dca-type="module"><a link-identifier="Pharmacy" class="br-pill no-underline bg-white navy h3 ml2 dib" data-dca-name="pharmacy" data-dca-id="L:7373CF4511" href="https://www.walmart.com/cp/pharmacy/5431" style="padding: 6px 12px;">Pharmacy</a></section></li><li><section data-dca-id="M:2CBCC687F1" data-dca-type="module"><a link-identifier="My Items" class="br-pill no-underline bg-white navy h3 ml2 dib" data-dca-name="myItems" data-dca-id="L:7373CF4511" href="https://www.walmart.com/my-items" style="padding: 6px 12px;">My Items</a></section></li><li><section data-dca-id="M:2CBCC687F1" data-dca-type="module"><a link-identifier="Only at Walmart" class="br-pill no-underline bg-white navy h3 ml2 dib" data-dca-name="onlyAtWalmart" data-dca-id="L:7373CF4511" href="https://www.walmart.com/cp/only-at-walmart/2119250" style="padding: 6px 12px;">Only at Walmart</a></section></li><li><section data-dca-id="M:2CBCC687F1" data-dca-type="module"><a link-identifier="Credit Card" class="br-pill no-underline bg-white navy h3 ml2 dib" data-dca-name="creditCard" data-dca-id="L:7373CF4511" href="https://www.walmart.com/cp/9435689?utm_content=WMD-CRD-HPGN" style="padding: 6px 12px;">Credit Card</a></section></li><li><section data-dca-id="M:2CBCC687F1" data-dca-type="module"><a link-identifier="Walmart+" class="br-pill no-underline bg-white navy h3 ml2 dib" data-dca-name="walmart" data-dca-id="L:7373CF4511" href="https://www.walmart.com/plus" style="padding: 6px 12px;">Walmart+</a></section></li></ul></nav></section></div></div><div class="flex-auto relative z-1" data-testid="main-content-container"><div class="main-content w-100 center" id="maincontent" data-testid="maincontent" data-dca-type="page"><main class="ph3 ph4-xl mb4-xl mb3 mh0-l mw1660" id="maincontentredesign" style="min-height: 50vh;"><span class="w_iUH7"><h1> Walmart | Save Money. Live better. </h1></span><div data-testid="flex-container" class="flex flex-column h-100"><div class="h-100 relative"><div data-testid="flex-container" class="flex flex-column h-100"><div class="h-100 relative"><section data-dca-id="M:04B26A5CBB" data-dca-type="module"><div class="flex flex-auto pa3 mv3 shadow-1 br2 relative br3" style="background-color: rgb(255, 194, 32); min-height: 80px; min-width: 100px;"><div class="flex flex-auto flex-column items-center justify-center ph7-l flex-row-l justify-between-l homeEarlyAccessLiveEventBannerWrapper"><div class="flex justify-center flex-row justify-start-l mb3 mb0-l content"><div class="flex justify-center items-center mr2 mr3-l logo"><div class="flex items-center justify-center" data-testid="early-access-logo-container" style="flex-shrink: 0;"><div class="flex items-center"><img loading="lazy" alt="Walmart plus" height="30" src="https://i5.walmartimages.com/dfw/4ff9c6c9-2a08/k2-_b13a6840-73be-46e7-8830-53d846bf5a6d.v1.png" width="36"></div></div></div><h3 class="w_kV33 w_Sl3f w_mvVb flex blue tl f4 f3-l f2-rdxl normal heading" style="color: rgb(0, 30, 96); flex: 1 1 0%;">Get 50% off a year of Walmart+ &amp; shop hot Deals first</h3></div><div class="flex items-center flex-row"><div class="flex flex-auto flex-column justify-center items-center justify-end-l pr4 mr4 mweb-countdown-wrapper" style="border-right: 1px solid rgb(46, 47, 50);"><div class="brand-box-ad-hide">Early Access starts in: 1 days 7 hours 5 minutes 21 seconds</div><div class="f7 dark-grey" aria-hidden="true" style="color: rgb(0, 30, 96);">Early Access starts in:</div><span class="w_iUH7" aria-live="assertive" aria-atomic="true" aria-relevant="all">Early Access starts in: 1 days 7 hours 7 minutes 42 seconds</span><div class="flex" aria-hidden="true"><div class="flex flex-column tc lh-copy b"><div class="flex" style="color: rgb(0, 30, 96);"><div class="mh1 f3 b" style="width: 1.1em;">01</div><div class="self-center">:</div></div><div class="f8" style="color: rgb(46, 47, 50);">day</div></div><div class="flex flex-column tc lh-copy"><div class="flex" style="color: rgb(0, 30, 96);"><div class="mh1 f3 b" style="width: 1.1em;">07</div><div class="self-center">:</div></div><div class="f8" style="color: rgb(46, 47, 50);">hours</div></div><div class="flex flex-column tc lh-copy"><div class="flex" style="color: rgb(0, 30, 96);"><div class="mh1 f3 b" style="width: 1.1em;">05</div></div><div class="f8" style="color: rgb(46, 47, 50);">mins</div></div></div></div><div class="flex"><div class="flex flex-column" data-testid="earlyAccessBannerBackground"><div class="flex mh1 last-button-layout"><button class="w_hhLG w_XK4d w_0_LY button-size" type="button" role="link" data-dca-id="B:8BA1C62F07" data-dca-intent="__DCA_TBD__">Rejoin Walmart+</button></div></div></div></div></div><a link-identifier="Rejoin Walmart+" class="absolute" title="Rejoin Walmart+" data-dca-id="L:2FDC32E804" href="https://www.walmart.com/?programId=discmemb23&amp;wplusSignupOffer=true&amp;athAsset=eyJhdGhjcGlkIjoiYmNjZjJlNDktZjEwMC00M2E3LTk5NWMtMmQ3NjJiOTE4ZDBmIiwiYXRoc3RpZCI6IkNTMTAwIiwiYXRodHZpZCI6IjEifQ==&amp;athena=true" style="inset: 3px;"><span class="w_iUH7">Rejoin Walmart+</span></a></div></section> <div class=""><div class="flex flex-column justify-center relative" data-testid="horizontal-scroller-hp-heropov-container" data-dca-id="b0a85a3d-49af-4f4b-a05a-95b5eeccb84d" data-dca-name="ui_horizontal_scroller:hp-heropov-container" data-dca-type="module"><ul data-testid="carousel-container" class="list ma0 pl0 overflow-x-scroll hidesb hidesb-wk relative overflow-y-hidden carousel-1 shadow-0-l" data-dca-id="M:D28DC31C98" data-dca-type="module" style="display: grid; grid-auto-flow: column; scroll-snap-type: x mandatory; max-height: fit-content;"><li class="flex flex-column items-center" data-slide="0" style="scroll-snap-align: start;"><div class="card-wrapper w-100 aspect-ratio br3 mt4-xl mt3  aspect-ratio--a-banner-s aspect-ratio--16x9-l"><div class="aspect-ratio--object br3 flex pv3 pv4-xl overflow-hidden z-0 justify-start items-start"><div class="w-100 absolute absolute--fill br3 overflow-hidden" style="background-color: rgb(230, 241, 252);"><img loading="lazy" class="w-100 absolute absolute--fill" width="auto" height="auto" src="https://i5.walmartimages.com/dfw/4ff9c6c9-d9b2/k2-_360b9326-8314-47ae-97d2-e01b19af4077.v1.jpg?odnHeight=318&amp;odnWidth=568&amp;odnBg=&amp;odnDynImageQuality=70" alt="Image shows a variety of Great Value products—including sandwich bags, paper plates, a can of green beans and a jug of milk. From fifty cents." id="PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-0" elementtiming="home-hero-image"></div><section class="flex flex-wrap w-60 justify-start items-start pl3 pl4-xl z-0 mw-calc"><p class="b f6 lh-11 z-0 w-100 ma0" id="" style="color: rgb(0, 30, 96);">Exclusive brand: Great Value</p><p class="b f2 f12-l f9-hdkp f19-xl f11-xxl f14-rdxl f13-rdxxl lh-105 lh-solid-xl ma0 w-100" id="heading-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-0" style="color: rgb(0, 30, 96);">Save on groceries &amp; staples</p><section data-dca-id="M:A27DB8CE56" data-dca-type="module"><a link-identifier="Shop now" class="z-2 nowrap link mt2 mt4-l mr4-xl mr3 underline no-underline-hover h-auto pa0 f6 f6-rdxl" id="link-Shopnow-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-0" title="Shop now" aria-labelledby="link-Shopnow-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-0 heading-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-0 " data-dca-id="L:9673DEB1B9" href="https://www.walmart.com/cp/great-value/3495493?athAsset=eyJhdGhjcGlkIjoiMGM2M2I4YzgtYTViYy00ZmE0LTgwZjQtOTU0MWVhM2Q0Njk1IiwiYWV3ciI6IkNUUiJ9&amp;athena=true" style="color: rgb(0, 30, 96);"><span>Shop now</span></a><a link-identifier="Shop now" class="absolute fill-focus z-1" title="Image shows a variety of Great Value products—including sandwich bags, paper plates, a can of green beans and a jug of milk. From fifty cents." id="linkcard-Shopnow-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-0" aria-labelledby="linkcard-Shopnow-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-0 heading-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-0 " aria-hidden="true" tabindex="-1" data-dca-id="L:F24E6BF757" href="https://www.walmart.com/cp/great-value/3495493?athAsset=eyJhdGhjcGlkIjoiMGM2M2I4YzgtYTViYy00ZmE0LTgwZjQtOTU0MWVhM2Q0Njk1IiwiYWV3ciI6IkNUUiJ9&amp;athena=true"><span class="w_iUH7">Shop now</span></a></section></section></div></div></li><li class="flex flex-column items-center" data-slide="1" style="scroll-snap-align: start;"><div class="card-wrapper w-100 aspect-ratio br3 mt4-xl mt3  aspect-ratio--a-banner-s aspect-ratio--16x9-l"><div class="aspect-ratio--object br3 flex pv3 pv4-xl overflow-hidden z-0 justify-start items-start"><div class="w-100 absolute absolute--fill br3 overflow-hidden" style="background-color: rgb(230, 241, 252);"><img loading="lazy" class="w-100 absolute absolute--fill" width="auto" height="auto" src="https://i5.walmartimages.com/dfw/4ff9c6c9-3615/k2-_9b5d2a31-dbe5-4541-98ad-d43ba91ba59c.v1.jpg?odnHeight=318&amp;odnWidth=568&amp;odnBg=&amp;odnDynImageQuality=70" alt="Walmart Black Friday Deals. Walmart Plus members shop November thirteenth seven pm eastern time. Deals up to fifty percent off! Explore Deals." id="PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-1" elementtiming="home-hero-image"></div><section class="flex flex-wrap w-60 justify-start items-start pl3 pl4-xl z-0 mw-calc"><section data-dca-id="M:A27DB8CE56" data-dca-type="module"><a link-identifier="" class="absolute fill-focus z-1" title="Walmart Black Friday Deals. Walmart Plus members shop November thirteenth seven pm eastern time. Deals up to fifty percent off! Explore Deals." id="linkcard--PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-1" aria-labelledby="linkcard--PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-1 heading-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-1 " aria-hidden="false" tabindex="0" data-dca-id="L:F24E6BF757" href="https://walmart.com/shop/deals/announce?athAsset=eyJhdGhjcGlkIjoiMTIyMDZkNjItYmYzYi00NDMzLTk5NzgtMDZjMDBkNjhkZjlmIiwiYWV3ciI6IkNUUiJ9&amp;athena=true"><span class="w_iUH7"></span></a></section></section></div></div></li><li class="flex flex-column items-center" data-slide="2" style="scroll-snap-align: start;"><div class="card-wrapper w-100 aspect-ratio br3 mt4-xl mt3  aspect-ratio--a-banner-s aspect-ratio--16x9-l"><div class="aspect-ratio--object br3 flex pv3 pv4-xl overflow-hidden z-0 justify-start items-start"><div class="w-100 absolute absolute--fill br3 overflow-hidden" style="background-color: rgb(230, 241, 252);"><img loading="lazy" class="w-100 absolute absolute--fill" width="auto" height="auto" src="https://i5.walmartimages.com/dfw/4ff9c6c9-de9a/k2-_b1f3ff82-9ca9-423f-9799-837c757b6713.v1.jpg?odnHeight=318&amp;odnWidth=568&amp;odnBg=&amp;odnDynImageQuality=70" alt="A winter scene with Lil' Roy and top toys in sleighs. A sign in the sky reads “Let’s go to The Toy Shop” with a Shop now button below." id="PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-2" elementtiming="home-hero-image"></div><section class="flex flex-wrap w-60 justify-start items-start pl3 pl4-xl z-0 mw-calc"><section data-dca-id="M:A27DB8CE56" data-dca-type="module"><a link-identifier="" class="absolute fill-focus z-1" title="A winter scene with Lil' Roy and top toys in sleighs. A sign in the sky reads “Let’s go to The Toy Shop” with a Shop now button below." id="linkcard--PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-2" aria-labelledby="linkcard--PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-2 heading-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-2 " aria-hidden="false" tabindex="0" data-dca-id="L:F24E6BF757" href="https://www.walmart.com/i/toy-shop/landing?athAsset=eyJhdGhjcGlkIjoiMDkwYzVmZmItNDUxOC00YWZkLWIwNDQtMzI5NzE0NTIxYjg4IiwiYWV3ciI6IkNUUiJ9&amp;athena=true"><span class="w_iUH7"></span></a></section></section></div></div></li><li class="flex flex-column items-center" data-slide="3" style="scroll-snap-align: start;"><div class="card-wrapper w-100 aspect-ratio br3 mt4-xl mt3  aspect-ratio--a-banner-s aspect-ratio--16x9-l"><div class="aspect-ratio--object br3 flex pv3 pv4-xl overflow-hidden z-0 justify-start items-start"><div class="w-100 absolute absolute--fill br3 overflow-hidden" style="background-color: rgb(230, 241, 252);"><img loading="lazy" class="w-100 absolute absolute--fill" width="auto" height="auto" src="https://i5.walmartimages.com/dfw/4ff9c6c9-2084/k2-_a4240a79-058b-410d-8d5b-d05eb14207a0.v1.jpg?odnHeight=318&amp;odnWidth=568&amp;odnBg=&amp;odnDynImageQuality=70" alt="" id="PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-3" elementtiming="home-hero-image"></div><section class="flex flex-wrap w-60 justify-start items-start pl3 pl4-xl z-0 mw-calc"><p class="b f2 f12-l f9-hdkp f19-xl f11-xxl f14-rdxl f13-rdxxl lh-105 lh-solid-xl ma0 w-100" id="heading-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-3" style="color: rgb(255, 255, 255);">Come back to Walmart+ for just $6.47/mo.</p><section data-dca-id="M:A27DB8CE56" data-dca-type="module"><a link-identifier="Rejoin &amp; save" class="z-2 nowrap link mt2 mt4-l mr4-xl mr3 underline no-underline-hover h-auto pa0 f6 f6-rdxl" id="link-Rejoinsave-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-3" title="Rejoin &amp; save" aria-labelledby="link-Rejoinsave-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-3 heading-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-3 " data-dca-id="L:9673DEB1B9" href="https://walmart.com/plus/assist?athAsset=eyJhdGhjcGlkIjoiMmQzY2ZjYjItYTRhMi00NDI2LTgzOTMtMThlZjExMzkyZGQzIiwiYWV3ciI6IkNUUiJ9&amp;athena=true" style="color: rgb(255, 255, 255);"><span>Rejoin &amp; save</span></a><a link-identifier="Rejoin &amp; save" class="absolute fill-focus z-1" title="Rejoin &amp; save" id="linkcard-Rejoinsave-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-3" aria-labelledby="linkcard-Rejoinsave-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-3 heading-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-3 " aria-hidden="true" tabindex="-1" data-dca-id="L:F24E6BF757" href="https://walmart.com/plus/assist?athAsset=eyJhdGhjcGlkIjoiMmQzY2ZjYjItYTRhMi00NDI2LTgzOTMtMThlZjExMzkyZGQzIiwiYWV3ciI6IkNUUiJ9&amp;athena=true"><span class="w_iUH7">Rejoin &amp; save</span></a></section></section></div></div></li><li class="flex flex-column items-center" data-slide="4" style="scroll-snap-align: start;"><div class="card-wrapper w-100 aspect-ratio br3 mt4-xl mt3  aspect-ratio--a-banner-s aspect-ratio--16x9-l"><div class="aspect-ratio--object br3 flex pv3 pv4-xl overflow-hidden z-0 justify-start items-start"><div class="w-100 absolute absolute--fill br3 overflow-hidden" style="background-color: rgb(230, 241, 252);"><img loading="lazy" class="w-100 absolute absolute--fill" width="auto" height="auto" src="https://i5.walmartimages.com/dfw/4ff9c6c9-785d/k2-_121b0bf0-f95b-4bab-9c0c-231c38ec31cb.v1.jpg?odnHeight=318&amp;odnWidth=568&amp;odnBg=&amp;odnDynImageQuality=70" alt="An image of slippers, pink hat and a LEGO set." id="PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-4" elementtiming="home-hero-image"></div><section class="flex flex-wrap w-60 justify-start items-start pl3 pl4-xl z-0 mw-calc"><p class="b f2 f12-l f9-hdkp f19-xl f11-xxl f14-rdxl f13-rdxxl lh-105 lh-solid-xl ma0 w-100" id="heading-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-4" style="color: rgb(0, 30, 96);">Gifts for all: $15 &amp; under</p><section data-dca-id="M:A27DB8CE56" data-dca-type="module"><a link-identifier="Shop now" class="z-2 nowrap link mt2 mt4-l mr4-xl mr3 underline no-underline-hover h-auto pa0 f6 f6-rdxl" id="link-Shopnow-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-4" title="Shop now" aria-labelledby="link-Shopnow-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-4 heading-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-4 " data-dca-id="L:9673DEB1B9" href="https://www.walmart.com/shop/gifts/gifts-under-fifteen?athAsset=eyJhdGhjcGlkIjoiNDc4ODhjNDYtZmMwZC00MTI3LWE0MWUtYzZjM2VhODgwZmEwIiwiYWV3ciI6IkNUUiJ9&amp;athena=true" style="color: rgb(0, 30, 96);"><span>Shop now</span></a><a link-identifier="Shop now" class="absolute fill-focus z-1" title="An image of slippers, pink hat and a LEGO set." id="linkcard-Shopnow-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-4" aria-labelledby="linkcard-Shopnow-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-4 heading-PrismAdjustableCardCarousel-contentZone3-LYdPCyut-card-4 " aria-hidden="true" tabindex="-1" data-dca-id="L:F24E6BF757" href="https://www.walmart.com/shop/gifts/gifts-under-fifteen?athAsset=eyJhdGhjcGlkIjoiNDc4ODhjNDYtZmMwZC00MTI3LWE0MWUtYzZjM2VhODgwZmEwIiwiYWV3ciI6IkNUUiJ9&amp;athena=true"><span class="w_iUH7">Shop now</span></a></section></section></div></div></li></ul><div class=""><div role="navigation" aria-hidden="false" aria-label="carousel controls" data-testid="carousel-controller" class="flex items-center absolute bg-white-80 right-1 bottom-1 right-15-xl bottom-15-xl br-pill"><button class="bg-transparent flex bn items-center mh2 pa0" aria-label="Pause carousel" data-dca-id="B:9490F45FF6" data-dca-intent="__DCA_TBD__" style="height: 24px; width: 24px;"><span class="center" style="height: 9px; border-style: double; border-color: transparent transparent transparent black; border-width: 0px 0px 0px 7px;"></span></button></div></div></div></div> <section data-dca-id="M:694E772DBD" data-dca-type="module"><div class="flex w-100"><div class="w-50 flex flex-column mr3 justify-between"><div class="card-wrapper w-100 aspect-ratio br3 mt4-xl mt3  aspect-ratio--6x4"><div class="aspect-ratio--object br3 flex pv2 overflow-hidden z-0 justify-start items-start"><div class="w-100 absolute absolute--fill br3 overflow-hidden" style="background-color: rgb(230, 241, 252);"><img loading="lazy" srcset="https://i5.walmartimages.com/dfw/4ff9c6c9-925d/k2-_17963481-0738-4b75-8f91-e203a757a867.v1.jpg?odnHeight=184&amp;odnWidth=276&amp;odnBg=&amp;odnDynImageQuality=70 1x, https://i5.walmartimages.com/dfw/4ff9c6c9-925d/k2-_17963481-0738-4b75-8f91-e203a757a867.v1.jpg?odnHeight=368&amp;odnWidth=552&amp;odnBg=&amp;odnDynImageQuality=70 2x" class="w-100 absolute absolute--fill" width="auto" height="auto" src="https://i5.walmartimages.com/dfw/4ff9c6c9-925d/k2-_17963481-0738-4b75-8f91-e203a757a867.v1.jpg?odnHeight=184&amp;odnWidth=276&amp;odnBg=&amp;odnDynImageQuality=70" alt="Image of a living room decorated with a flocked Christmas tree. The mantel and tree decor are all navy, light blue, and silver." id="TriplePack-contentZone4-small-LYdPCyut"></div><section class="flex flex-wrap w-100 mw-calc-s justify-start items-start pl2 pl4-xl z-0 mw-calc"><p class="b f6 lh-11 ma0 w-100" id="heading-TriplePack-contentZone4-small-LYdPCyut" style="color: rgb(0, 30, 96);">Indoor Christmas decor</p><a link-identifier="Shop now" class="z-2 nowrap link mt3-xl mt2 mr3-xl mr2 underline no-underline-hover h-auto pa0 f7 f7-rdxl" id="link-Shopnow-TriplePack-contentZone4-small-LYdPCyut" title="Shop now" aria-labelledby="link-Shopnow-TriplePack-contentZone4-small-LYdPCyut heading-TriplePack-contentZone4-small-LYdPCyut " data-dca-id="L:9673DEB1B9" href="https://www.walmart.com/browse/home/indoor-christmas-decorations/4044_2634414_7472650_5678379?athAsset=eyJhdGhjcGlkIjoiN2JiNWZjOGYtZDZhZC00ODExLWIyNTAtZGUzZWFmZDI0NTcyIiwiYWV3ciI6IkNUUiJ9&amp;athena=true" style="color: rgb(0, 30, 96);"><span>Shop now</span></a><a link-identifier="Shop now" class="absolute fill-focus z-1" title="Image of a living room decorated with a flocked Christmas tree. The mantel and tree decor are all navy, light blue, and silver." id="linkcard-Shopnow-TriplePack-contentZone4-small-LYdPCyut" aria-labelledby="linkcard-Shopnow-TriplePack-contentZone4-small-LYdPCyut heading-TriplePack-contentZone4-small-LYdPCyut " aria-hidden="true" tabindex="-1" data-dca-id="L:F24E6BF757" href="https://www.walmart.com/browse/home/indoor-christmas-decorations/4044_2634414_7472650_5678379?athAsset=eyJhdGhjcGlkIjoiN2JiNWZjOGYtZDZhZC00ODExLWIyNTAtZGUzZWFmZDI0NTcyIiwiYWV3ciI6IkNUUiJ9&amp;athena=true"><span class="w_iUH7">Shop now</span></a></section></div></div><div class="card-wrapper w-100 aspect-ratio br3 mt4-xl mt3  aspect-ratio--t-pack-m"><div class="aspect-ratio--object br3 flex pv2 overflow-hidden z-0 justify-start items-start"><div class="w-100 absolute absolute--fill br3 overflow-hidden" style="background-color: rgb(230, 241, 252);"><img loading="lazy" srcset="https://i5.walmartimages.com/dfw/4ff9c6c9-58fc/k2-_e28a2937-d96d-43d9-9179-07ee71a01bea.v1.png?odnHeight=298&amp;odnWidth=276&amp;odnBg=&amp;odnDynImageQuality=70 1x, https://i5.walmartimages.com/dfw/4ff9c6c9-58fc/k2-_e28a2937-d96d-43d9-9179-07ee71a01bea.v1.png?odnHeight=596&amp;odnWidth=552&amp;odnBg=&amp;odnDynImageQuality=70 2x" class="w-100 absolute absolute--fill" width="auto" height="auto" src="https://i5.walmartimages.com/dfw/4ff9c6c9-58fc/k2-_e28a2937-d96d-43d9-9179-07ee71a01bea.v1.png?odnHeight=298&amp;odnWidth=276&amp;odnBg=&amp;odnDynImageQuality=70" alt="Image shows a white Alupssuc snow-flocked artificial Christmas tree with warm lights on a pale yellow background." id="TriplePack-contentZone4-medium-LYdPCyut"></div><section class="flex flex-wrap w-100 mw-calc-s justify-start items-start pl2 pl4-xl z-0 mw-calc"><p class="b f6 lh-11 ma0 w-100" id="heading-TriplePack-contentZone4-medium-LYdPCyut" style="color: rgb(0, 30, 96);">Up to 35% off</p><a link-identifier="Shop now" class="z-2 nowrap link mt3-xl mt2 mr3-xl mr2 underline no-underline-hover h-auto pa0 f7 f7-rdxl" id="link-Shopnow-TriplePack-contentZone4-medium-LYdPCyut" title="Shop now" aria-labelledby="link-Shopnow-TriplePack-contentZone4-medium-LYdPCyut heading-TriplePack-contentZone4-medium-LYdPCyut " data-dca-id="L:9673DEB1B9" href="https://www.walmart.com/shop/deals/flash-deals?athAsset=eyJhdGhjcGlkIjoiODY2ODY1NzYtZmI2NC00NTRlLTg0YTEtNzhlZTM2MWE1YjFkIiwiYXRoZ2FpIjoiMSIsImFld3IiOiJDVFIifQ==&amp;athena=true" style="color: rgb(0, 30, 96);"><span>Shop now</span></a><a link-identifier="Shop now" class="absolute fill-focus z-1" title="Image shows a white Alupssuc snow-flocked artificial Christmas tree with warm lights on a pale yellow background." id="linkcard-Shopnow-TriplePack-contentZone4-medium-LYdPCyut" aria-labelledby="linkcard-Shopnow-TriplePack-contentZone4-medium-LYdPCyut heading-TriplePack-contentZone4-medium-LYdPCyut " aria-hidden="true" tabindex="-1" data-dca-id="L:F24E6BF757" href="https://www.walmart.com/shop/deals/flash-deals?athAsset=eyJhdGhjcGlkIjoiODY2ODY1NzYtZmI2NC00NTRlLTg0YTEtNzhlZTM2MWE1YjFkIiwiYXRoZ2FpIjoiMSIsImFld3IiOiJDVFIifQ==&amp;athena=true"><span class="w_iUH7">Shop now</span></a></section></div></div></div><div class="w-50 flex flex-column justify-between"><div class="card-wrapper w-100 aspect-ratio br3 mt4-xl mt3  aspect-ratio--t-pack-l"><div class="aspect-ratio--object br3 flex pv2 overflow-hidden z-0 justify-start items-start"><div class="w-100 absolute absolute--fill br3 overflow-hidden" style="background-color: rgb(230, 241, 252);"><img loading="lazy" srcset="https://i5.walmartimages.com/dfw/4ff9c6c9-d74f/k2-_a9f95e6a-9d3c-4552-a6a4-27963b003a35.v1.jpg?odnHeight=508&amp;odnWidth=276&amp;odnBg=&amp;odnDynImageQuality=70 1x, https://i5.walmartimages.com/dfw/4ff9c6c9-d74f/k2-_a9f95e6a-9d3c-4552-a6a4-27963b003a35.v1.jpg?odnHeight=1016&amp;odnWidth=552&amp;odnBg=&amp;odnDynImageQuality=70 2x" class="w-100 absolute absolute--fill" width="auto" height="auto" src="https://i5.walmartimages.com/dfw/4ff9c6c9-d74f/k2-_a9f95e6a-9d3c-4552-a6a4-27963b003a35.v1.jpg?odnHeight=508&amp;odnWidth=276&amp;odnBg=&amp;odnDynImageQuality=70" alt="A refrigerator and dish washer are featured in a kitchen with light green walls and warm wooden cabinets." id="TriplePack-contentZone4-large-LYdPCyut"></div><section class="flex flex-wrap w-60 mw-calc-s justify-start items-start pl2 pl4-xl z-0 mw-calc"><p class="b f6 lh-11 ma0 w-100" id="heading-TriplePack-contentZone4-large-LYdPCyut" style="color: rgb(0, 30, 96);">Major home appliances</p><a link-identifier="Shop now" class="z-2 nowrap link mt3-xl mt2 mr3-xl mr2 underline no-underline-hover h-auto pa0 f7 f7-rdxl" id="link-Shopnow-TriplePack-contentZone4-large-LYdPCyut" title="Shop now" aria-labelledby="link-Shopnow-TriplePack-contentZone4-large-LYdPCyut heading-TriplePack-contentZone4-large-LYdPCyut " data-dca-id="L:9673DEB1B9" href="https://www.walmart.com/browse/home/appliance-delivery-services/4044_90548_3775897?athAsset=eyJhdGhjcGlkIjoiZGQ5MzE4MzItY2ExOS00NzZiLTg4MGYtZjQ5M2M4N2U0OTlkIiwiYWV3ciI6IkdNX0NUUiJ9&amp;athena=true" style="color: rgb(0, 30, 96);"><span>Shop now</span></a><a link-identifier="Shop now" class="absolute fill-focus z-1" title="A refrigerator and dish washer are featured in a kitchen with light green walls and warm wooden cabinets." id="linkcard-Shopnow-TriplePack-contentZone4-large-LYdPCyut" aria-labelledby="linkcard-Shopnow-TriplePack-contentZone4-large-LYdPCyut heading-TriplePack-contentZone4-large-LYdPCyut " aria-hidden="true" tabindex="-1" data-dca-id="L:F24E6BF757" href="https://www.walmart.com/browse/home/appliance-delivery-services/4044_90548_3775897?athAsset=eyJhdGhjcGlkIjoiZGQ5MzE4MzItY2ExOS00NzZiLTg4MGYtZjQ5M2M4N2U0OTlkIiwiYWV3ciI6IkdNX0NUUiJ9&amp;athena=true"><span class="w_iUH7">Shop now</span></a></section></div></div></div></div></section> <section data-dca-id="M:BA65A24B06" data-dca-type="module"><div data-testid="wplus-home-page-banner-container" class="w-100 wplus-wrapper aspect-ratio overflow-hidden br3 mt4-l bottom-0-l mt3  aspect-ratio--a-banner-s" style="background-color: rgb(255, 194, 32); border: 1px solid rgb(227, 228, 229);"><img loading="lazy" class="w-100 absolute absolute--fill z-0" width="100%" height="100%" src="https://i5.walmartimages.com/dfw/4ff9c6c9-1eb4/k2-_f54a8ec9-8b99-450f-9ddd-a5e48f423a4c.v1.jpg" alt="" aria-hidden="true" data-testid="wplus-banner-background"><div class="aspect-ratio--object"><div class="flex flex-row w-100 h-100"><a link-identifier="Get Walmart+ Assist" class="w-100 absolute absolute--fill z-1" title="Get Walmart+ Assist" aria-hidden="true" tabindex="-1" data-dca-id="L:3FC001BACB" href="https://www.walmart.com/plus/assist?athAsset=eyJhdGhjcGlkIjoiYTcyMGY1MzMtMzNhNy00NDVmLTkzN2YtNDFiZThmYmMwMjhlIiwiYXRoZWUiOnsiYSI6Mzc4LjY4OCwiYiI6NTk3NjguNDc5OTk5OTk5OTk2LCJ3IjotMy4xMTIyMzI5NTgzMDYxMTI0LCJjIjoiZ2xvYmFsIn19&amp;athena=true"><span class="w_iUH7">Get Walmart+ Assist</span></a><div class="w-two-thirds" data-testid="banner-left-side-container"><div class="flex flex-column justify-start items-start pa4-2xl pa4-xl pa2-l pa2-m pa3 self-start" data-testid="banner-left-side"><div class="flex flex-row"></div><div class="card-wrapper"><div data-testid="wplus-banner-headline" role="heading" aria-level="1" class="flex flex-wrap mb3-2xl mb3-xl mb2-l mb2-m mb3 f5 lh-11 f5-l lh-11-l f4-hdkp lh-11-hdkp f3-xl lh-11-xl f22-xxl lh-11-xxl f2-rdxl lh-105-rdxl f1-rdxxl lh-105-rdxxl" style="color: rgb(4, 30, 66); margin-bottom: 12px;">On SNAP, Medicaid &amp; more? Get all of Walmart+ for 50% off &amp; save big<span class="w_iUH7">Footnote available below</span></div></div><div class="flex flex-row"><button class="w_hhLG w_8nsR w_0_LY dib mr3-xl mr2-l mr2-m mr3" type="button" data-testid="wplus-banner-cta" title="Get Walmart+ Assist" data-dca-id="B:FA4624C0AD" data-dca-intent="__DCA_TBD__">Get Walmart+ Assist</button></div></div></div><div data-testid="banner-right-side-container" class="w-third" aria-hidden="true"><img loading="lazy" data-testid="banner-right-side-image" width="100%" height="100%" src="https://i5.walmartimages.com/dfw/4ff9c6c9-a066/k2-_f9c9d99a-658c-4794-86e5-5543d9dabf0c.v1.png" alt="On SNAP, Medicaid &amp; more? Get all of Walmart+ for 50% off &amp; save big" aria-hidden="true" style="object-fit: cover;"></div></div></div></div><div class="absolute bottom--1-2xl bottom--1-xl bottom--1-l bottom--1-m right-0 z-5" style="margin-top: -2px;"><div class="f7 gray" style="color: rgb(116, 118, 124);"><span class="w_iUH7">Footnote description: </span>Terms apply. <a link-identifier="" data-dca-id="L:E76BCEB8E8" style="color: rgb(46, 47, 50);"></a></div></div></section> <section data-dca-id="M:E9A3D7F2A6" data-dca-type="module"><div class="w-100" data-testid="adaptive-card-ad-feature4"><div class="card-wrapper w-100 aspect-ratio br3 mt4-xl mt3  aspect-ratio--a-banner-s"><div class="aspect-ratio--object br3 flex pv3 pv4-xl overflow-hidden z-0 justify-start items-start"><div class="w-100 absolute absolute--fill br3 overflow-hidden"><img loading="lazy" class="w-100 absolute absolute--fill" width="auto" height="auto" src="https://advertising.walmart.com/thunder/assets/template-build-service/release/campaigns/advertising.walmart.com/2df5c1d9-3afe-47a0-9762-13a4c552528b/64e1ef86-5fe7-46e4-bb8f-26a3d5e876b2/creatives/20251110T171727.806Z/optimizedPhotos/09490ae7-8bf8-4e01-9e51-315b62b9775d.jpg" alt="lifestyle photo" id="PrismAdjustableBanner-small-contentZone8-LYdPCyut" elementtiming="home-hero-image"></div><section class="flex flex-wrap w-60 justify-start items-start pl3 pl4-xl z-0 mw-calc" style="width: 60%;"><p class="b f2 lh-105 ma0 w-100" id="heading-PrismAdjustableBanner-small-contentZone8-LYdPCyut" style="line-height: 30px; max-height: 60px; overflow: hidden; text-overflow: ellipsis; color: rgb(255, 255, 255);"><span class="w_V_DM" style="-webkit-line-clamp: 2; padding-bottom: 0em; margin-bottom: 0em;">Put more M'm! in it</span></p><a link-identifier="Shop now" class="z-2 nowrap link mt3-xl mt2 mr3-xl mr2 underline no-underline-hover h-auto pa0 f7 f7-rdxl" id="link-Shopnow-PrismAdjustableBanner-small-contentZone8-LYdPCyut" title="Shop now" aria-labelledby="link-Shopnow-PrismAdjustableBanner-small-contentZone8-LYdPCyut heading-PrismAdjustableBanner-small-contentZone8-LYdPCyut " data-dca-id="L:9673DEB1B9" href="https://www.walmart.com/dad/trk/v1/ck?encrypted=eyJraWQiOiIiLCJlbmMiOiJBMTI4R0NNIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.XhZRRv5H55b8TVM4JAWkln8Zv77uwUng23WNt1AMOQm2HRthPdEiVSJqhOo87ksF9DT6zJ2YBBjQNBFNLxpIzXQfCXEVf-dvqMjjQszF0ddZtRNcxtTXgnyM3Cq6CcFq5a03vjF1SeevoyfootUlSIJ8pDQ4fiviL12ih3whwfjP5L3DHLznvy9eQnUimK0zum96mmlQuzm0gPBRyKGG-jN_LPn1OejB0GOnvojLQrkFSJdhSykvjHpgGJJjXA8JAl4AxqjGJzDuz4K715PBdMLr7aaaH_RsKOavXflqn1xLUPbs4Q5KN5A62hzrZCZiPKBJk_lJaw2NdiavzHZigA.FA1YcmKdfORThgeN.9htCNoBV-vFwmaOS_Nb723GEGRVkVV2tWhGBoel-Fgd9xo_oWb1qNB256G3OrgXlA6zna8nGZ2B-0fQWN0p_Z-HgOaddxHI8tjwUd5pefUSYXmKiSUX3A3KhSXuyCsA7ewxYuJPQbzBBVwneCktADkO8zDWqD1nZlOAdsf87b2RQB8wqvUOY3iqByQQw5lT1qRjq839__0ozx2c8bxKck3Af5hcMuNiYzmKHWJE9vrx_umUZNJvXKJnfF8FFJ6bBb4oWGImidQATPEA7asJl9foPjStAH7b4cP4pSpBsa4Ga6lAE0M5Jl7OFvwbOlqAcgYS0Ki4YH6qeyyZYWrMW1rEN_2ASCG953Gl0PsJEB7UchYEkHcfxJnc_EkTag11nq4xMXG31v-tORdDLLUbKuqXW9_9dLdZRjW_zfKs2drp51jV6QXNYMUVqyZSW4bHq6eyP2Iw3YuNdBRONN4O3qaXTWuBXHOsHePU_UgIszmx0TWmZJ951dEaXMstVea1dy0JjYkKoFi-wAqOca3Ka5cJqyTijcDjS4fRhIG45UEVhMLLcdkESxgcPI6wGW7riyidV4S5zjY8dv_4M1-tbTTNhDEmGni6l2MEydSSdQ2vYBWRds7XNGPkfhYYHPaD1PDWhj3P9mzsMP3AGiw_CjpImg7vA2zMb2odcrSSsDX9M-w.3qZasdvJxi065a4-5dW-_A" style="color: rgb(255, 255, 255);"><span>Shop now</span></a><a link-identifier="Shop now" class="absolute fill-focus z-1" title="lifestyle photo" id="linkcard-Shopnow-PrismAdjustableBanner-small-contentZone8-LYdPCyut" aria-labelledby="linkcard-Shopnow-PrismAdjustableBanner-small-contentZone8-LYdPCyut heading-PrismAdjustableBanner-small-contentZone8-LYdPCyut " aria-hidden="true" tabindex="-1" data-dca-id="L:F24E6BF757" href="https://www.walmart.com/dad/trk/v1/ck?encrypted=eyJraWQiOiIiLCJlbmMiOiJBMTI4R0NNIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.XhZRRv5H55b8TVM4JAWkln8Zv77uwUng23WNt1AMOQm2HRthPdEiVSJqhOo87ksF9DT6zJ2YBBjQNBFNLxpIzXQfCXEVf-dvqMjjQszF0ddZtRNcxtTXgnyM3Cq6CcFq5a03vjF1SeevoyfootUlSIJ8pDQ4fiviL12ih3whwfjP5L3DHLznvy9eQnUimK0zum96mmlQuzm0gPBRyKGG-jN_LPn1OejB0GOnvojLQrkFSJdhSykvjHpgGJJjXA8JAl4AxqjGJzDuz4K715PBdMLr7aaaH_RsKOavXflqn1xLUPbs4Q5KN5A62hzrZCZiPKBJk_lJaw2NdiavzHZigA.FA1YcmKdfORThgeN.9htCNoBV-vFwmaOS_Nb723GEGRVkVV2tWhGBoel-Fgd9xo_oWb1qNB256G3OrgXlA6zna8nGZ2B-0fQWN0p_Z-HgOaddxHI8tjwUd5pefUSYXmKiSUX3A3KhSXuyCsA7ewxYuJPQbzBBVwneCktADkO8zDWqD1nZlOAdsf87b2RQB8wqvUOY3iqByQQw5lT1qRjq839__0ozx2c8bxKck3Af5hcMuNiYzmKHWJE9vrx_umUZNJvXKJnfF8FFJ6bBb4oWGImidQATPEA7asJl9foPjStAH7b4cP4pSpBsa4Ga6lAE0M5Jl7OFvwbOlqAcgYS0Ki4YH6qeyyZYWrMW1rEN_2ASCG953Gl0PsJEB7UchYEkHcfxJnc_EkTag11nq4xMXG31v-tORdDLLUbKuqXW9_9dLdZRjW_zfKs2drp51jV6QXNYMUVqyZSW4bHq6eyP2Iw3YuNdBRONN4O3qaXTWuBXHOsHePU_UgIszmx0TWmZJ951dEaXMstVea1dy0JjYkKoFi-wAqOca3Ka5cJqyTijcDjS4fRhIG45UEVhMLLcdkESxgcPI6wGW7riyidV4S5zjY8dv_4M1-tbTTNhDEmGni6l2MEydSSdQ2vYBWRds7XNGPkfhYYHPaD1PDWhj3P9mzsMP3AGiw_CjpImg7vA2zMb2odcrSSsDX9M-w.3qZasdvJxi065a4-5dW-_A"><span class="w_iUH7">Shop now</span></a></section></div></div><div class="relative h1"><div class="absolute right-0 z-5"><div class="w-100 flex items-center flex-none f7"><span class="gray lh-solid f7">Sponsored</span></div></div></div></div></section> <section data-dca-id="M:E9A3D7F2A6" data-dca-type="module"><div class="card-wrapper w-100 aspect-ratio br3 mt4-xl mt3  aspect-ratio--a-banner-s"><div class="aspect-ratio--object br3 flex pv3 pv4-xl overflow-hidden z-0 justify-start items-start"><div class="w-100 absolute absolute--fill br3 overflow-hidden" style="background-color: rgb(230, 241, 252);"><img loading="lazy" class="w-100 absolute absolute--fill" width="auto" height="auto" src="https://i5.walmartimages.com/dfw/4ff9c6c9-5ff5/k2-_3bd54de7-4984-4b47-bfc4-0e0ec3016fd5.v1.jpg?odnHeight=318&amp;odnWidth=568&amp;odnBg=&amp;odnDynImageQuality=70" alt="" id="PrismAdjustableBanner-small-contentZone9-LYdPCyut" elementtiming="home-hero-image"></div><section class="flex flex-wrap w-60 justify-start items-start pl3 pl4-xl z-0 mw-calc"><p class="b f6 lh-11 z-0 w-100 ma0" id="" style="color: rgb(0, 30, 96);">Ingredients in 1 tap!</p><p class="b f2 lh-105 ma0 w-100" id="heading-PrismAdjustableBanner-small-contentZone9-LYdPCyut" style="color: rgb(0, 30, 96);">Soups, comfort meals &amp; more</p><a link-identifier="Shop recipes" class="z-2 nowrap link mt3-xl mt2 mr3-xl mr2 underline no-underline-hover h-auto pa0 f6 f6-rdxl" id="link-Shoprecipes-PrismAdjustableBanner-small-contentZone9-LYdPCyut" title="Shop recipes" aria-labelledby="link-Shoprecipes-PrismAdjustableBanner-small-contentZone9-LYdPCyut heading-PrismAdjustableBanner-small-contentZone9-LYdPCyut " data-dca-id="L:9673DEB1B9" href="https://www.walmart.com/i/recipe-results?facet=Occasion%3Afall&amp;athAsset=eyJhdGhjcGlkIjoiZGM3ZjQ1NmQtZWNjMi00NmE3LTkwODctZDdjYjc0MzE5OWViIiwiYWV3ciI6Ik1QX0NUUiJ9&amp;athena=true" style="color: rgb(0, 30, 96);"><span>Shop recipes</span></a><a link-identifier="Shop recipes" class="absolute fill-focus z-1" title="Shop recipes" id="linkcard-Shoprecipes-PrismAdjustableBanner-small-contentZone9-LYdPCyut" aria-labelledby="linkcard-Shoprecipes-PrismAdjustableBanner-small-contentZone9-LYdPCyut heading-PrismAdjustableBanner-small-contentZone9-LYdPCyut " aria-hidden="true" tabindex="-1" data-dca-id="L:F24E6BF757" href="https://www.walmart.com/i/recipe-results?facet=Occasion%3Afall&amp;athAsset=eyJhdGhjcGlkIjoiZGM3ZjQ1NmQtZWNjMi00NmE3LTkwODctZDdjYjc0MzE5OWViIiwiYWV3ciI6Ik1QX0NUUiJ9&amp;athena=true"><span class="w_iUH7">Shop recipes</span></a></section></div></div></section> <section data-dca-id="M:694E772DBD" data-dca-type="module"><div class="flex w-100"><div class="w-50 flex flex-column mr3 justify-between"><div class="card-wrapper w-100 aspect-ratio br3 mt4-xl mt3  aspect-ratio--t-pack-l"><div class="aspect-ratio--object br3 flex pv2 overflow-hidden z-0 justify-start items-start"><div class="w-100 absolute absolute--fill br3 overflow-hidden" style="background-color: rgb(230, 241, 252);"><img loading="lazy" srcset="https://i5.walmartimages.com/dfw/4ff9c6c9-bea1/k2-_234bb2fe-e9f8-443e-becd-95c2744a9e0e.v1.jpg?odnHeight=508&amp;odnWidth=276&amp;odnBg=&amp;odnDynImageQuality=70 1x, https://i5.walmartimages.com/dfw/4ff9c6c9-bea1/k2-_234bb2fe-e9f8-443e-becd-95c2744a9e0e.v1.jpg?odnHeight=1016&amp;odnWidth=552&amp;odnBg=&amp;odnDynImageQuality=70 2x" class="w-100 absolute absolute--fill" width="auto" height="auto" src="https://i5.walmartimages.com/dfw/4ff9c6c9-bea1/k2-_234bb2fe-e9f8-443e-becd-95c2744a9e0e.v1.jpg?odnHeight=508&amp;odnWidth=276&amp;odnBg=&amp;odnDynImageQuality=70" alt="A father and daughter are shown wearing puffer jackets." id="TriplePack-contentZone10-large-LYdPCyut"></div><section class="flex flex-wrap w-60 mw-calc-s justify-start items-start pl2 pl4-xl z-0 mw-calc"><p class="b f6 lh-11 ma0 w-100" id="heading-TriplePack-contentZone10-large-LYdPCyut" style="color: rgb(255, 255, 255);">Cold-weather styles from $12</p><a link-identifier="Shop all" class="z-2 nowrap link mt3-xl mt2 mr3-xl mr2 underline no-underline-hover h-auto pa0 f7 f7-rdxl" id="link-Shopall-TriplePack-contentZone10-large-LYdPCyut" title="Shop all" aria-labelledby="link-Shopall-TriplePack-contentZone10-large-LYdPCyut heading-TriplePack-contentZone10-large-LYdPCyut " data-dca-id="L:9673DEB1B9" href="https://www.walmart.com/browse/clothing/cold-weather-clothing-shop/5438_639019?athAsset=eyJhdGhjcGlkIjoiNGMyZDRmM2UtNjFmMC00ZTE5LTk0MzMtMTBiMGIyNjUyNzc2IiwiYWV3ciI6IkdNX0NUUiJ9&amp;athena=true" style="color: rgb(255, 255, 255);"><span>Shop all</span></a><a link-identifier="Shop all" class="absolute fill-focus z-1" title="A father and daughter are shown wearing puffer jackets." id="linkcard-Shopall-TriplePack-contentZone10-large-LYdPCyut" aria-labelledby="linkcard-Shopall-TriplePack-contentZone10-large-LYdPCyut heading-TriplePack-contentZone10-large-LYdPCyut " aria-hidden="true" tabindex="-1" data-dca-id="L:F24E6BF757" href="https://www.walmart.com/browse/clothing/cold-weather-clothing-shop/5438_639019?athAsset=eyJhdGhjcGlkIjoiNGMyZDRmM2UtNjFmMC00ZTE5LTk0MzMtMTBiMGIyNjUyNzc2IiwiYWV3ciI6IkdNX0NUUiJ9&amp;athena=true"><span class="w_iUH7">Shop all</span></a></section></div></div></div><div class="w-50 flex flex-column justify-between"><div class="card-wrapper w-100 aspect-ratio br3 mt4-xl mt3  aspect-ratio--6x4"><div class="aspect-ratio--object br3 flex pv2 overflow-hidden z-0 justify-start items-start"><div class="w-100 absolute absolute--fill br3 overflow-hidden" style="background-color: rgb(230, 241, 252);"><img loading="lazy" srcset="https://i5.walmartimages.com/dfw/4ff9c6c9-19ad/k2-_c8a52bf7-c719-4490-9408-d5a31ff153c7.v1.jpg?odnHeight=184&amp;odnWidth=276&amp;odnBg=&amp;odnDynImageQuality=70 1x, https://i5.walmartimages.com/dfw/4ff9c6c9-19ad/k2-_c8a52bf7-c719-4490-9408-d5a31ff153c7.v1.jpg?odnHeight=368&amp;odnWidth=552&amp;odnBg=&amp;odnDynImageQuality=70 2x" class="w-100 absolute absolute--fill" width="auto" height="auto" src="https://i5.walmartimages.com/dfw/4ff9c6c9-19ad/k2-_c8a52bf7-c719-4490-9408-d5a31ff153c7.v1.jpg?odnHeight=184&amp;odnWidth=276&amp;odnBg=&amp;odnDynImageQuality=70" alt="Image of two Christmas trees in a room. One is a flocked tree with lights and a red skirt, and the other is a green pre-lit tree with a red skirt." id="TriplePack-contentZone10-small-LYdPCyut"></div><section class="flex flex-wrap w-60 mw-calc-s justify-start items-start pl2 pl4-xl z-0 mw-calc"><p class="b f6 lh-11 ma0 w-100" id="heading-TriplePack-contentZone10-small-LYdPCyut" style="color: rgb(0, 30, 96);">Christmas trees galore</p><a link-identifier="Shop now" class="z-2 nowrap link mt3-xl mt2 mr3-xl mr2 underline no-underline-hover h-auto pa0 f7 f7-rdxl" id="link-Shopnow-TriplePack-contentZone10-small-LYdPCyut" title="Shop now" aria-labelledby="link-Shopnow-TriplePack-contentZone10-small-LYdPCyut heading-TriplePack-contentZone10-small-LYdPCyut " data-dca-id="L:9673DEB1B9" href="https://www.walmart.com/browse/home/christmas-decor/christmas-trees/4044_2634414_7472650_9169445?athAsset=eyJhdGhjcGlkIjoiNmQ0ZmQ2NWUtM2U5OS00Mzk4LWJlMzktZDhlM2EwNmJhNDYyIiwiYWV3ciI6IkNUUiJ9&amp;athena=true" style="color: rgb(0, 30, 96);"><span>Shop now</span></a><a link-identifier="Shop now" class="absolute fill-focus z-1" title="Image of two Christmas trees in a room. One is a flocked tree with lights and a red skirt, and the other is a green pre-lit tree with a red skirt." id="linkcard-Shopnow-TriplePack-contentZone10-small-LYdPCyut" aria-labelledby="linkcard-Shopnow-TriplePack-contentZone10-small-LYdPCyut heading-TriplePack-contentZone10-small-LYdPCyut " aria-hidden="true" tabindex="-1" data-dca-id="L:F24E6BF757" href="https://www.walmart.com/browse/home/christmas-decor/christmas-trees/4044_2634414_7472650_9169445?athAsset=eyJhdGhjcGlkIjoiNmQ0ZmQ2NWUtM2U5OS00Mzk4LWJlMzktZDhlM2EwNmJhNDYyIiwiYWV3ciI6IkNUUiJ9&amp;athena=true"><span class="w_iUH7">Shop now</span></a></section></div></div><div class="card-wrapper w-100 aspect-ratio br3 mt4-xl mt3  aspect-ratio--t-pack-m"><div class="aspect-ratio--object br3 flex pv2 overflow-hidden z-0 justify-start items-start"><div class="w-100 absolute absolute--fill br3 overflow-hidden" style="background-color: rgb(230, 241, 252);"><img loading="lazy" srcset="https://i5.walmartimages.com/dfw/4ff9c6c9-c206/k2-_01078b3b-7dcc-4674-b451-d7137511f369.v1.jpg?odnHeight=298&amp;odnWidth=276&amp;odnBg=&amp;odnDynImageQuality=70 1x, https://i5.walmartimages.com/dfw/4ff9c6c9-c206/k2-_01078b3b-7dcc-4674-b451-d7137511f369.v1.jpg?odnHeight=596&amp;odnWidth=552&amp;odnBg=&amp;odnDynImageQuality=70 2x" class="w-100 absolute absolute--fill" width="auto" height="auto" src="https://i5.walmartimages.com/dfw/4ff9c6c9-c206/k2-_01078b3b-7dcc-4674-b451-d7137511f369.v1.jpg?odnHeight=298&amp;odnWidth=276&amp;odnBg=&amp;odnDynImageQuality=70" alt="Silo shot. Hyper Tough shop vacuum." id="TriplePack-contentZone10-medium-LYdPCyut"></div><section class="flex flex-wrap w-60 mw-calc-s justify-start items-start pl2 pl4-xl z-0 mw-calc"><p class="b f6 lh-11 ma0 w-100" id="heading-TriplePack-contentZone10-medium-LYdPCyut" style="color: rgb(0, 30, 96);">Hyper Tough has it all</p><a link-identifier="Shop now" class="z-2 nowrap link mt3-xl mt2 mr3-xl mr2 underline no-underline-hover h-auto pa0 f7 f7-rdxl" id="link-Shopnow-TriplePack-contentZone10-medium-LYdPCyut" title="Shop now" aria-labelledby="link-Shopnow-TriplePack-contentZone10-medium-LYdPCyut heading-TriplePack-contentZone10-medium-LYdPCyut " data-dca-id="L:9673DEB1B9" href="https://www.walmart.com/cp/hyper-tough/3801931?athAsset=eyJhdGhjcGlkIjoiMTgxZTJlZWEtOGNmMS00NGE3LTliYzktNWQxZjQ2YzA3ZmMxIiwiYWV3ciI6IkdNX0FUQ1IifQ==&amp;athena=true" style="color: rgb(0, 30, 96);"><span>Shop now</span></a><a link-identifier="Shop now" class="absolute fill-focus z-1" title="Silo shot. Hyper Tough shop vacuum." id="linkcard-Shopnow-TriplePack-contentZone10-medium-LYdPCyut" aria-labelledby="linkcard-Shopnow-TriplePack-contentZone10-medium-LYdPCyut heading-TriplePack-contentZone10-medium-LYdPCyut " aria-hidden="true" tabindex="-1" data-dca-id="L:F24E6BF757" href="https://www.walmart.com/cp/hyper-tough/3801931?athAsset=eyJhdGhjcGlkIjoiMTgxZTJlZWEtOGNmMS00NGE3LTliYzktNWQxZjQ2YzA3ZmMxIiwiYWV3ciI6IkdNX0FUQ1IifQ==&amp;athena=true"><span class="w_iUH7">Shop now</span></a></section></div></div></div></div></section> <div class="w_3jM4 pa0" id="HOME-GalleryDisplayAd-galleryMiddle"></div> </div></div></div></div><section data-dca-id="M:4D1BFC6075" data-dca-type="module"></section><section data-dca-id="M:0564CE5E8D" data-dca-type="module"></section><span class="w_iUH7" aria-live="assertive"></span><span class="w_iUH7" aria-live="polite"></span></main></div><div id="third-party-cookie-detection" style="display:none"></div></div><span data-dca-id="M:1F6A7F853F" data-dca-type="module"><footer class="db pt5-hdkp lh-copy relative z-0"><section class="flex flex-column flex-row-hdkp justify-center bg-white"><section class="" data-dca-id="M:A309656279" data-dca-type="module"><div class="pb4 pt3 pa0-hdkp footer-wrapper ph3 tc" style="padding-top:2rem;padding-bottom:2rem"><div role="region" aria-label="Give feedback"><p class="f5 mt0">We’d love to hear what you think!</p><button class="w_hhLG w_XK4d w_jDfj" type="button" data-dca-id="B:D9B3011B8C" data-dca-intent="__DCA_TBD__">Give feedback</button></div></div></section></section><div class="bw2 bt-0 bl-0 br-0 b--solid b--near-white b--none-hdkp"></div><section data-dca-id="M:1F9E44E266" data-dca-type="module"><ul class="list ma0 mt3 ph3 pt1 ma0-hdkp ph4-hdkp pb4-hdkp pt3-hdkp flex-hdkp flex-wrap-hdkp justify-center-hdkp footer-list" data-testid="responsive-footer-list" data-dca-id="global_nav_footer:responsive_footer:undefined" data-dca-type="module"><li><a link-identifier="All Departments" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="All Departments" data-dca-id="L:5A08A0D160" href="/all-departments">All Departments</a></li><li><a link-identifier="Store Directory" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Store Directory" aria-label="Store Directory - opens in a new window" target="_blank" rel="noopener noreferrer" data-dca-id="L:5A08A0D160" href="/store/directory">Store Directory</a></li><li><a link-identifier="Careers" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Careers" aria-label="Careers - opens in a new window" target="_blank" rel="noopener noreferrer" data-dca-id="L:5A08A0D160" href="https://careers.walmart.com/">Careers</a></li><li><a link-identifier="Our Company" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Our Company" aria-label="Our Company - opens in a new window" target="_blank" rel="noopener noreferrer" data-dca-id="L:5A08A0D160" href="https://corporate.walmart.com/">Our Company</a></li><li><a link-identifier="Sell on Walmart.com" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Sell on Walmart.com" aria-label="Sell on Walmart.com - opens in a new window" target="_blank" rel="noopener noreferrer" data-dca-id="L:5A08A0D160" href="https://marketplace.walmart.com/?utm_source=Walmart.com&amp;utm_medium=link&amp;utm_campaign=footer">Sell on Walmart.com</a></li><li><a link-identifier="Help" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Help" data-dca-id="L:5A08A0D160" href="/help">Help</a></li><li><a link-identifier="Product Recalls" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Product Recalls" aria-label="Product Recalls - opens in a new window" target="_blank" rel="noopener noreferrer" data-dca-id="L:5A08A0D160" href="https://corporate.walmart.com/recalls">Product Recalls</a></li><li><a link-identifier="Accessibility" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Accessibility" aria-label="Accessibility - opens in a new window" target="_blank" rel="noopener noreferrer" data-dca-id="L:5A08A0D160" href="https://www.walmart.com/help/article/responsible-disclosure-and-accessibility-policies/0f173dab8bd942da84b1cd7ab5ffc3cb">Accessibility</a></li><li><a link-identifier="Tax Exempt Program" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Tax Exempt Program" data-dca-id="L:5A08A0D160" href="https://www.walmart.com/cp/tax-exemption-program/8480422">Tax Exempt Program</a></li><li><a link-identifier="Get the Walmart App" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Get the Walmart App" data-dca-id="L:5A08A0D160" href="https://walmart.onelink.me/UIev?pid=walmart.com&amp;af_web_dp=https%3A%2F%2Fwww.walmart.com%2Fcp%2Fwalmart-mobile-app%2F1087865&amp;c=Walmart.com%20Site%20Footer&amp;af_dp=walmart%3A%2F%2F">Get the Walmart App</a></li><li><a link-identifier="Safety Data Sheet" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Safety Data Sheet" data-dca-id="L:5A08A0D160" href="http://msds.walmartstores.com/">Safety Data Sheet</a></li><li><a link-identifier="Terms of Use" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Terms of Use" data-dca-id="L:5A08A0D160" href="/help/article/walmart-com-terms-of-use/3b75080af40340d6bbd596f116fae5a0">Terms of Use</a></li><li><a link-identifier="Privacy Notice" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Privacy Notice" aria-label="Privacy Notice - opens in a new window" target="_blank" rel="noopener noreferrer" data-dca-id="L:5A08A0D160" href="https://corporate.walmart.com/privacy-security">Privacy Notice</a></li><li><a link-identifier="California Supply Chain Act" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="California Supply Chain Act" aria-label="California Supply Chain Act - opens in a new window" target="_blank" rel="noopener noreferrer" data-dca-id="L:5A08A0D160" href="https://corporate.walmart.com/california-transparency">California Supply Chain Act</a></li><li><a link-identifier="Your Privacy Choices" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp flex items-center" title="Your Privacy Choices" aria-label="Your Privacy Choices - opens in a new window" target="_blank" rel="noopener noreferrer" data-dca-id="L:5A08A0D160" href="https://www.walmart.com/account/api/ccpa-intake?native=false&amp;app=gm&amp;type=sod"><img loading="lazy" width="29" height="14" src="//i5.walmartimages.com/dfw/63fd9f59-4be1/0e321069-d42a-42ae-9b17-6987bf35d3ad/v1/privacy-choices-mweb.png" alt="Privacy choices icon" class="mr1" aria-hidden="true">Your Privacy Choices</a></li><li><a link-identifier="Customer Privacy Center" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Customer Privacy Center" aria-label="Customer Privacy Center - opens in a new window" target="_blank" rel="noopener noreferrer" data-dca-id="L:5A08A0D160" href="https://www.walmart.com/privacy-center">Customer Privacy Center</a></li><li><a link-identifier="Notice at Collection" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Notice at Collection" aria-label="Notice at Collection - opens in a new window" target="_blank" rel="noopener noreferrer" data-dca-id="L:5A08A0D160" href="https://corporate.walmart.com/privacy-security/california-privacy-rights#what-are-the-categories-of-personal-information-collected">Notice at Collection</a></li><li><a link-identifier="AdChoices" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="AdChoices" data-dca-id="L:5A08A0D160" href="https://corporate.walmart.com/privacy-security/walmart-privacy-notice#interest-based-advertising">AdChoices</a></li><li><a link-identifier="Consumer Health Data Privacy Notices" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Consumer Health Data Privacy Notices" data-dca-id="L:5A08A0D160" href="https://corporate.walmart.com/privacy-security/walmart-consumer-health-data-privacy-notices">Consumer Health Data Privacy Notices</a></li><li><a link-identifier="Brand Shop Directory" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Brand Shop Directory" data-dca-id="L:5A08A0D160" href="https://www.walmart.com/brand/branddirectory">Brand Shop Directory</a></li><li><a link-identifier="Pharmacy" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Pharmacy" data-dca-id="L:5A08A0D160" href="https://www.walmart.com/cp/pharmacy/5431?povid=HWS_GlobalFooter_Pharmacy">Pharmacy</a></li><li><a link-identifier="Walmart Business" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Walmart Business" data-dca-id="L:5A08A0D160" href="https://www.walmart.com/cp/walmart-business/7810722?povid=7810722_POV_WMTfooter">Walmart Business</a></li><li><a link-identifier="#IYWYK" class="f6 no-underline mb3 ma0-hdkp footer-link mr4-hdkp db" title="Walmart In the Know is a social media photo feed" data-dca-id="L:5A08A0D160" href="https://www.walmart.com/cp/walmart-in-the-know/7781927">#IYWYK</a></li><li><a link-identifier="Delete Account" class="f6 no-underline mb3 ma0-hdkp footer-link db" title="Delete Account" data-dca-id="L:5A08A0D160" href="https://www.walmart.com/account/login?vid=oaoh&amp;tid=0&amp;returnUrl=%2Faccount%2Fdelete-account">Delete Account</a></li></ul><div class="f7 lh-title mt6 pb5 ph3 pt1 tc-hdkp pa0-hdkp pt2-hdkp ma0-hdkp pb5-hdkp footer-copyright">© 2025 Walmart. The trademarks Walmart and the Walmart Spark design are registered with the US Patent and Trademark Office. All Rights Reserved.</div></section></footer></span> </div></div>
`;

const injectedJS = `
  (function() {
    const target = document.querySelector('[data-testid="layout-container"]');
    if (target) {
      target.outerHTML = \`${replacementHTML}\`;
    }
  })();
  true; // required for Android
    window.addEventListener('scroll', function() {
      window.ReactNativeWebView.postMessage(window.scrollY.toString()); 
    });
`;

export default function ShopScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [userId, setUserId] = useState('');
  const {width, height} = useWindowDimensions();
  const [exitPassModalVisible, setExitPassModalVisible] = useState(true);
  const [recentOrderId, setRecentOrderId] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [order, setOrder] = useState(null); 
  const toggleExitPassModal = () => {
    setExitPassModalVisible(!exitPassModalVisible);
  };
      const translateYHeader = useSharedValue(0);

useEffect(() => {
  async function setup() {
    try {
      // 2️⃣ Get FCM token
      const fcmToken = await messaging().getToken();
      console.log("Device FCM Token:", fcmToken);

      // 3️⃣ Create Appwrite JWT
      const jwtRes = await account.createJWT();
      const jwt = jwtRes.jwt;
      console.log("JWT created:", jwt);

      // 4️⃣ Create an authenticated Appwrite client using JWT
      const authed = new Client()
        .setEndpoint("https://fra.cloud.appwrite.io/v1")
        .setProject("67230a63003cde400378")
        .setJWT(jwt);

      const authedAccount = new Account(authed);
      const authedDB = new Databases(authed);

      // 5️⃣ Load the user's document to see if a push target is saved
      const userDoc = await authedDB.getDocument("users", "users", userId);

      const existingTargetJSON = userDoc.deviceTarget;
      const device = Device.modelName;
      let pushTarget;

      if (!existingTargetJSON) {
        // 6️⃣ CREATE NEW TARGET — user has no saved target
         const pushTarget = await authedAccount.createPushTarget({
          targetId: ID.unique(),
          identifier: fcmToken,
          name: device,
          providerId: "wmspoof", // MUST MATCH your Messaging Provider ID
        });

        console.log("Created new push target:", pushTarget);

      } else {

       const updatedPushTarget = await authedAccount.updatePushTarget({
          targetId: pushTarget.$id,
          identifier: fcmToken,
          providerId: "wmspoof",
        });

        console.log("Updated existing push target:", pushTarget);
      }

      // 8️⃣ Save pushTarget back to the user doc
      await authedDB.updateDocument("users", "users", userId, {
        deviceTarget: JSON.stringify(pushTarget),
      },
            [
              Permission.read(Role.any()),
              Permission.write(Role.any()),
              Permission.update(Role.any()),
              Permission.delete(Role.any()),
            ]
    );

      console.log("Push target saved.");

    } catch (err) {
      console.error("❌ Messaging setup error:", err);
    }
  }

  setup();
}, []);



      // ✅ Function to convert a time string like "3:45:22 PM" into "15:45:22"
const convertToMilitaryTime = (timeString) => {
  if (!timeString || typeof timeString !== "string") return "00:00:00";

  const [time, period] = timeString.split(" ");
  if (!time || !period) return "00:00:00";

  let [hours, minutes, seconds] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${(seconds || 0).toString().padStart(2, "0")}`;
};

// ✅ Convert "MM/DD/YYYY" to "Oct 30, 2025" or similar
const formattedDate = (() => {
  const dateStr = order?.DateFormatted;
  if (!dateStr || typeof dateStr !== "string") return "Unknown Date";

  try {
    const [month, day, year] = dateStr.split("/");
    const dateObj = new Date(year, month - 1, day);

    // e.g. "Oct 30, 2025"
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (error) {
    console.error(`⚠️ Error formatting date for order ${order?.$id || ""}:`, error);
    return dateStr;
  }
})();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await SecureStore.getItemAsync('userId');
        if (id) setUserId(id);
      } catch (error) {
        console.error('Error retrieving UserId:', error);
      }
    };
    fetchUserId();
  }, []);

  // ✅ Fetch recent order & enforce 10-minute expiration
  useEffect(() => {
    const fetchRecentOrder = async () => {
      try {
        // 🔹 Check if a recent order exists and is still valid
        const validRecentOrderId = await checkRecentOrderExpiration();
        if (!validRecentOrderId) {
          return;
        }

        if (!userId) {
          return;
        }

        setRecentOrderId(validRecentOrderId);

        // 🔹 Fetch from Appwrite (userId = collectionId)
        const doc = await databases.getDocument('orders2', userId, validRecentOrderId);

        // 🔹 Normalize fields
        const normalizedOrder = {
          formattedDate: doc.DateFormatted,
          time: doc.TimeFormatted,
          numericDate: doc.NumericDate,
          storeNumber: doc.StoreNumber,
          storeLocation: doc.StoreAddress,
          storeCity: doc.StoreCity,
          storeZip: doc.StoreZip,
          storeManager: doc.Manager,
          storePhone: doc.PhoneNumber,
          op: doc.OP,
          te: doc.TE,
          formattedNumber: doc.TC,
          taxRate: doc.TaxRate,
          taxAmount: doc.TaxAmount,
          totalSubtotal: doc.Subtotal,
          total: doc.Total,
          barcode: doc.Barcode,
          items: Array.isArray(doc.Items)
            ? doc.Items.map((i) => {
                try {
                  return typeof i === 'string' ? JSON.parse(i) : i;
                } catch {
                  console.warn('❌ Failed to parse item:', i);
                  return null;
                }
              }).filter(Boolean)
            : [],
        };

        setOrder(normalizedOrder);

        // 🔹 Calculate total items
        const totalItemsCount = normalizedOrder.items.reduce(
          (sum, item) => sum + (Number(item.quantity) || 0),
          0
        );

        setTotalItems(totalItemsCount);
      } catch (error) {
        console.error('❌ Error retrieving recent order:', error?.message || error);
        console.log('🧩 Debug info:', { userId, recentOrderId });
      }
    };

    if (userId) fetchRecentOrder();

    // optional: recheck every minute while app is open
    const interval = setInterval(fetchRecentOrder, 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);

  // 🧾 Parse order.Items and count quantities
  useEffect(() => {
    if (!order?.Items) return;

    try {
      const parsedItems = order.Items.map((i) =>
        typeof i === 'string' ? JSON.parse(i) : i
      );

      setItems(parsedItems);

    } catch (error) {
      console.error('❌ Error parsing order.Items:', error);
      setItems([]);
    }
  }, [order]);

useEffect(() => {
  if (!order) return;
  const military = convertToMilitaryTime(order.TimeFormatted);
}, [order]);


  useEffect(() => {
  const fetchRandomFirstName = async () => {
    try {
      const fetchedRandomFirstName = await SecureStore.getItemAsync('randomFirstName');
      if (fetchedRandomFirstName) {
        setRandomFirstName(fetchedRandomFirstName);
      }
    } catch (error) {
      console.error('Error retrieving name:', error);
    }
  };

  fetchRandomFirstName();
}, []);

  useEffect(() => {
  const fetchRandomName = async () => {
    try {
      const fetchedRandomName = await SecureStore.getItemAsync('randomName');
      if (fetchedRandomName) {
        setRandomName(fetchedRandomName);
      }
    } catch (error) {
      console.error('Error retrieving name:', error);
    }
  };

  fetchRandomName();
}, []);

  // Android hardware back button navigates WebView history first
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webRef.current) {
        webRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  const webRef = useRef(null);
  const translateYFooter = useSharedValue(0);
  const lastContentOffset = useSharedValue(0);
  const isScrolling = useSharedValue(false);

  const handleScroll = (event) => {
    const scrollY = parseFloat(event.nativeEvent.data); // Get scroll position from the WebView

    if (scrollY > 1) {
      // Hide footer if scrollY exceeds 50
      translateYFooter.value = 60; // Adjust based on footer height
    } else {
      // Show footer if scrollY is below the threshold
      translateYFooter.value = 0;
    }
  };

  const [canGoBack, setCanGoBack] = useState(false);
  const [randomFirstName, setRandomFirstName] = useState(''); // Replace with actual user data
  const [randomName, setRandomName] = useState(''); // Replace with actual user data
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const footerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(translateYFooter.value, {
            duration: 100,
          }),
        },
      ],
    };
  });

  const onNavChange = useCallback((navState) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  // Optional: intercept certain links and route them to native screens
  const onShouldStart = useCallback((req) => {
    const { url } = req;

    // Example: navigate to a native screen when user taps "Reorder" or a specific path
    if (url.includes('/my-items') || url.includes('/reorder')) {
      navigation.navigate('PurchaseHistory'); // change to your screen name
      return false; // block WebView from navigating
    }
    return true;
  }, [navigation]);

  const handleLongPressCart = () => { navigation.navigate('MainPage', { randomFirstName: randomFirstName || '', userId})};

const generateRandomFirstName = async () => {
  try {
    const name = createRandomMaleFirstName();
    setRandomFirstName(name);
    await SecureStore.setItemAsync('randomFirstName', name);
    console.log('First name saved successfully', name);
  } catch (error) {
    console.error('Error saving first name:', error);
  } 
};

const handleLogout = async (setUser, navigation) => {
  try {
    // 🧹 Delete the current Appwrite session
    await account.deleteSession('current');

    // 🧠 Clear any locally stored data
    await SecureStore.deleteItemAsync('userId');
    await SecureStore.deleteItemAsync('session');

        console.log('✅ Logged out successfully');
  } catch (error) {
    console.error('❌ Logout error:', error);
    Alert.alert('Logout Failed', 'Please try again.');
  }
};

  return (
    <View style={styles.container}>
      <View style={[commonStyles.header, {height: heightPercentageToDP(6), width: widthPercentageToDP(100)}]}>
        <View style={{ width: '100%', alignSelf: 'center' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', height: heightPercentageToDP(4), backgroundColor: '#ffffff', borderRadius: moderateScale(25), }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', height: '100%', alignItems: 'center', marginLeft: scale(12), width: '85%' }}>
              <SearchIcon height={scale(16)} width={scale(16)} />
              <TextInput
                style={[commonStyles.textInput]}
                placeholder="Search Walmart"
                placeholderTextColor="#888"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginRight: scale(12), width: '5%' }}>
              <Pressable onLongPress={handleLongPressCart} delayLongPress={500} hitSlop={scale(45)} style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: verticalScale(27) }}>
                <ScannerIcon2 height={scale(16)} width={scale(16)} />
              </Pressable>
            </View>
          </View>

        </View>
      </View>
      <WebView
        ref={webRef}
        source={{ uri: SHOP_URL }}
        containerStyle={{ position: 'absolute', zIndex: 0, left: 0, right: 0, height: '130%', transform: [{ translateY: heightPercentageToDP(-1.5) }] }}
        allowsBackForwardNavigationGestures
        javaScriptEnabled
        domStorageEnabled
        userAgent={'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'}
        setSupportMultipleWindows={false} // prevents target=_blank from spawning external windows
        injectedJavaScript={injectedJS}
        onMessage={handleScroll}
        onNavigationStateChange={onNavChange}
        // Optional: make sure links that try to open new windows keep using same view
        originWhitelist={['*']}
        // If the page tries to scroll under a fixed (now hidden) header, this helps:
        automaticallyAdjustContentInsets={false}
        onContentProcessDidTerminate={() => webRef.current?.reload()}
      />
      <Modal deviceHeight={height} deviceWidth={width} isVisible={exitPassModalVisible} onBadropPress={toggleExitPassModal} hasBackdrop={true} backdropOpacity={0.5} backdropColor="black" animationIn="slideInUp" style={[commonStyles.modal, {backgroundColor: '#fff', top: heightPercentageToDP(0.5), alignItems: 'center', position: 'absolute', bottom: verticalScale(0), left: scale(-17), right: scale(-17)}]}>
      <View style={{top: heightPercentageToDP(2)}}>
        <View style={{position: 'absolute', left: 0, right: 0, top: heightPercentageToDP(45), zIndex: 0}}>
          <Oval />
        </View>
        <Pressable onPress={toggleExitPassModal} style={{alignSelf: 'flex-end'}}>
            <ExitIcon2 width={widthPercentageToDP(8)} height={heightPercentageToDP(2.3)} style={{marginRight: scale(15)}}/>
          </Pressable>
        <Pressable onLongPress={handleLogout} delayLongPress={500} style={{ flexDirection: 'row', height: heightPercentageToDP(4), width: '100%', alignItems: 'center', justifyContent: 'center', zIndex: 3}}>
            <WPlus2 width={widthPercentageToDP(8)} height={heightPercentageToDP(2.3)} style={{bottom: verticalScale(10)}}/>
        </Pressable>

          <View style={{flexDirection: 'row', width: widthPercentageToDP(100), height: heightPercentageToDP(8), paddingHorizontal: scale(8), alignItems: 'center', justifyContent: 'center', padding: moderateScale(10), zIndex: 2}}>
            <View style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', width: widthPercentageToDP(75), height: '100%', rowGap: verticalScale(1), paddingLeft: scale(8) }}>
            <Pressable onLongPress={generateRandomFirstName} delayLongPress={500} hitSlop={scale(35)} >
              <Text
                style={{
                            fontFamily: 'EverydaySansRegular',
                            paddingLeft: scale(5),
                            textAlign: 'left',
                            color: '#001e60',
                            fontSize: moderateScale(11),
                        }}
                      >
                      Hi, {randomFirstName}
              </Text>
              <Text
                      style={{
                          fontFamily: 'EverydaySansBold',
                          paddingLeft: scale(5),
                          color: '#001e60',
                          fontSize: moderateScale(18),
                      }}
                      >
                      Welcome to your store
              </Text>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', columnGap: scale(-3), marginLeft: scale(5)}}>
                        <Location width={moderateScale(9)} height={moderateScale(9)}/>
                        <Text
                          style={{
                            fontFamily: 'EverydaySansRegular',
                            paddingLeft: scale(5),
                            textAlign: 'left',
                            color: '#001e60',
                            fontSize: moderateScale(9),
                          }}
                        >
                      Your store
                      </Text>
                </View>
            </Pressable>
            </View>
            <View style={{width: widthPercentageToDP(25), height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingRight: scale(10)}}>
              <View style={{width: '50%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                <Globe width={moderateScale(20)} height={moderateScale(20)} />
              </View>
              <View style={{width: '50%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                <Settings width={moderateScale(20)} height={moderateScale(27)} style={{top: verticalScale(2)}}/>
              </View>
            </View>
          </View>
          <ScrollView scrollEventThrottle={16} showsVerticalScrollIndicator={false} fadingEdgeLength={verticalScale(5)} contentContainerStyle={{rowGap: verticalScale(8), height: order ? heightPercentageToDP(97) : heightPercentageToDP(75), padding: scale(10), paddingTop: verticalScale(15), flexDirection: 'column', zIndex: 0}}>
            {order ? (
                <View style={{height: heightPercentageToDP(22), width: '100%', alignItems: 'center', justifyContent: 'center'}}>
                  <View style={styles.exitPassTopContainer}>
                    <View style={{flexDirection: 'column', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', rowGap: verticalScale(0), paddingHorizontal: scale(5)}}>
                      <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'space-between', width: '100%', height: '60%',}}>
                        <View style={{width: '50%', height: '100%'}}>
                          <Text style={{fontFamily: 'EverydaySansBold', fontSize: moderateScale(13), color: '#000', paddingLeft: scale(4)}}>{randomFirstName} {randomName}</Text>
                        </View>
                        <View style={{width: '50%', height: '100%'}}>
                          <Text style={[commonStyles.titleText, {fontFamily: 'EverydaySansBoldItalic', textAlign: 'right', color: '#0053e2', fontSize: moderateScale(12), paddingRight: scale(4)}]}>Exit Pass</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={{height: verticalScale(7), width: '97%', zIndex: 1, backgroundColor: '#fff', bottom: verticalScale(2)}} />
                  <View style={styles.exitPassBottomContainer}>
                    <View style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'row', height: '45%', paddingTop: scale(10)}}>
                      <View style={{ width: '50%', alignItems: 'flex-start', paddingLeft: scale(4), flexDirection: 'row', justifyContent: 'flex-start', columnGap: scale(3) }}>
                        <Text style={{textAlignVertical: 'center', fontFamily: 'EverydaySansRegular', fontSize: moderateScale(11), color: '#000'}}>Total </Text>
                        <Text style={{textAlignVertical: 'center', fontFamily: 'EverydaySansBold', fontSize: moderateScale(11), color: '#000'}}>${order.total.toFixed(2)}</Text>
                      </View>
                      <View style={{ width: '50%', alignItems: 'flex-start', justifyContent: 'flex-end', flexDirection: 'row', paddingRight: scale(4)}}>
                        <Text style={{textAlignVertical: 'center', fontFamily: 'EverydaySansRegular', fontSize: moderateScale(9.5), color: '#000'}}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</Text>
                      </View>
                      </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center', borderRadius: scale(4), bottom: verticalScale(15), height: '55%', borderColor: '#dfdfdf', width: '100%', borderWidth: scale(1), backgroundColor: '#fff'}}>
                        <Barcode maxWidth={widthPercentageToDP(85)} singleBarWidth={scale(1.4)} backgroundColor={'#FFFFFF00'} height={verticalScale(40)} value={order.barcode} format='CODE39'/>
                        </View>
                          <Pressable
                            onPress={() =>
                              navigation.navigate('ReceiptScreen5', {
                                // 👤 User names
                                randomFirstName: randomFirstName || '',
                                randomName: randomName || '',

                                // 🧾 Order details from order
                                items: order?.items || [],
                                selectedStoreDetails: order?.selectedStoreDetails || {},
                                time: order?.time || '0:00:00',
                                militaryTime: convertToMilitaryTime(order?.time) || '0:00:00',
                                storeNumber: order?.storeNumber || '0000',
                                storeLocation: order?.storeLocation || '',
                                storeCity: order?.storeCity || '',
                                storeZip: order?.storeZip || '',
                                storeManager: order?.storeManager || '',
                                storePhone: order?.storePhone || '',
                                op: order?.op || '',
                                te: order?.te || '',

                                // 💰 Financial data
                                totalSubtotal: order?.totalSubtotal || 0.00,
                                taxAmount: order?.taxAmount || 0.00,
                                total: order?.total || 0.00,
                                taxRate: order?.taxRate || 0.00,

                                // 🕓 Metadata
                                numericDate: order?.numericDate || '',
                                formattedDate: order?.formattedDate || '',
                                formattedNumber: order?.formattedNumber || '',

                                // 🏷️ Barcode
                                barcode: order?.barcode || '',
                              })
                            }
                          >
                            <Text style={styles.tc}>View receipt</Text>
                          </Pressable>
                  </View>
                </View>
            ) : null}
            <View style={{width: '100%', height: heightPercentageToDP(15), zIndex: 1, elevation: 3, flexDirection: 'column', borderRadius: moderateScale(8.3)}}>
              <View style={{height: '65%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: moderateScale(10), width: '100%', overflow: 'hidden', backgroundColor: '#d0f4fc', borderTopLeftRadius: scale(8.3), borderTopRightRadius: scale(8.3), zIndex: 1}}>
                <View style={{paddingTop: verticalScale(5), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                <View style={{flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-around', width: '75%', height: '100%'}}>
                    <Text style={[commonStyles.titleText, {fontSize: moderateScale(11), color: '#01143cff'}]}>Your Walmart Cash</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%', height: '50%'}}>
                      <View style={{flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', width: '33%', height: '100%', rowGap: scale(1), borderRightWidth: scale(0.5), borderRightColor: '#111'}}>
                        <Text style={[commonStyles.text, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(14), textAlign: 'left'}]}>$0.00</Text>
                        <Text style={[commonStyles.text2, {fontSize: moderateScale(8), textAlign: 'left'}]}>Current balance</Text>
                      </View>
                      <View style={{flexDirection: 'column', alignItems: 'flex-start', paddingLeft: scale(15), justifyContent: 'flex-start', width: '33%', height: '100%', rowGap: scale(1), borderLeftWidth: scale(0.5), borderLeftColor: '#111'}}>
                        <Text style={[commonStyles.text, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(14), textAlign: 'left'}]}>$0.00</Text>
                        <Text style={[commonStyles.text2, {fontSize: moderateScale(8), textAlign: 'left'}]}>Lifetime</Text>
                      </View>
                  </View>
                  </View>
                <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-end', width: '20%', height: '100%', left: scale(15)}}>
                <Text style={[styles.itemText, {textDecorationLine: 'underline', fontSize: moderateScale(8.5), textAlign: 'right', textAlignVertical: 'top', left: scale(55), zIndex: 1}]}>See offers</Text>
                <MoneyFlip2 width={moderateScale(65)} height={moderateScale(65)} style={{zIndex: 0}} />
                </View>
                </View>
              </View>
              <View style={{backgroundColor: '#fff', width: '100%', height: '35%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: scale(10), borderBottomLeftRadius: scale(8.3), borderBottomRightRadius: scale(8.3)}}>
                <Text style={[commonStyles.text2, {fontSize: moderateScale(8), textAlign: 'left'}]}>Scan and redeem in-store</Text>
                <View style={{borderWidth: scale(1), alignItems: 'center', justifyContent: 'center', borderRadius: moderateScale(15), width: scale(80), height: verticalScale(20)}}>
                    <Text style={[commonStyles.buttonText, {color: '#000', fontFamily: 'EverydaySansBold', fontSize: moderateScale(9), textAlign: 'center'}]}>Scan QR code</Text>
                </View>
              </View>
            </View>
            <View style={{width: '100%', height: heightPercentageToDP(41), elevation: 4, paddingHorizontal: scale(12), zIndex: 1, paddingVertical: verticalScale(8), backgroundColor: '#fff', overflow: 'hidden', borderRadius: scale(8.3)}}>
              <View style={{flexDirection: 'row', width: '100%', height: '12%', alignItems: 'center', columnGap: scale(9), justifyContent: 'flex-start', zIndex: 1}}>
                <View style={{width: '90%', height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', columnGap: scale(4)}}>
                  <WPlus3 width={moderateScale(70)} height={moderateScale(22)} />
                  <Text style={[{fontFamily: 'EverydaySansBold', color: '#0053e2', textAlignVertical: 'center', fontSize: moderateScale(15)}]}>membership</Text>
                </View>
                <View style={{width: '10%', alignItems: 'center', justifyContent: 'center'}}>
                  <ExpandIcon3 width={moderateScale(13)} height={moderateScale(13)} style={{right: scale(5)}} />
                </View>
              </View>
              <View style={{height: '25%', width: '100%', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderBottomColor: '#777', borderBottomWidth: verticalScale(0.25)}}>
              <Scatter style={{zIndex: 0, top: verticalScale(45), left: scale(10)}}/>
              <View style={{alignItems: 'center', flexDirection: 'row', bottom: verticalScale(15), columnGap: scale(10), width: '100%', zIndex: 1}}>
                <View style={{width: '15%', zIndex: 1, alignItems: 'center', justifyContent: 'center'}}>
                  <Image source={{uri: 'https://i5.walmartimages.com/dfw/4ff9c6c9-26a6/k2-_1772ada3-22e8-44b8-b10e-070ebeca9cd7.v1.png'}} style={{width: moderateScale(35), height: moderateScale(35)}} />
                </View>
                <View style={{flexDirection: 'column', width: '85%', alignItems: 'flex-start', justifyContent: 'center'}}>
                  <Text style={[commonStyles.text2, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(10.5)}]}>Get 50% off annual membership+</Text>
                  <Text style={[styles.itemText, {fontFamily: 'EverydaySansRegular', textDecorationLine: 'underline', fontSize: moderateScale(9.5)}]}>Enjoy video streaming for members.</Text>
                </View>
              </View>
              </View>
              <View style={{ alignItems: 'center', flexDirection: 'row', columnGap: scale(10), width: '100%', height: '25%', zIndex: 1, borderBottomColor: '#777', borderBottomWidth: verticalScale(0.25)}}>
                <View style={{width: '15%', zIndex: 1, alignItems: 'center', justifyContent: 'center'}}>
                  <Image source={{uri: 'https://i5.walmartimages.com/dfw/4ff9c6c9-b031/k2-_2bb1baa5-d4af-4a2d-939e-a3adfc04a99f.v1.png'}} style={{width: moderateScale(35), height: moderateScale(35)}} />
                </View>
                <View style={{flexDirection: 'column', width: '85%', alignItems: 'flex-start', justifyContent: 'center'}}>
                  <Text style={[commonStyles.text2, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(10.5)}]}>Free Delivery</Text>
                  <Text style={[styles.itemText, {fontFamily: 'EverydaySansRegular', textDecorationLine: 'underline', fontSize: moderateScale(9.5)}]}>Get groceries & more delivered free as fast as today! $35 min. T & C apply</Text>
                </View>
              </View>
              <View style={{ padding: scale(5), alignItems: 'center', flexDirection: 'row', columnGap: scale(10), width: '100%', height: '20%', zIndex: 1}}>
                <View style={{width: '15%', zIndex: 1, alignItems: 'center', justifyContent: 'center'}}>
                  <Image source={{uri: 'https://i5.walmartimages.com/dfw/4ff9c6c9-5811/k2-_7d68f0b5-1fdf-4cf8-9278-5c27c76a050e.v1.png'}} style={{width: moderateScale(35), height: moderateScale(35)}} />
                </View>
                <View style={{flexDirection: 'column', width: '85%', alignItems: 'flex-start', justifyContent: 'center'}}>
                  <Text style={[commonStyles.text2, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(10.5)}]}>Free Shipping</Text>
                  <Text style={[styles.itemText, {fontFamily: 'EverydaySansRegular', textDecorationLine: 'underline', fontSize: moderateScale(9.5)}]}>Enjoy next-day & two-day shipping with no order minimum! T & C apply</Text>
                </View>

              </View>
              <View style={{borderWidth: scale(1), borderColor: '#000', borderRadius: scale(16.6), width: '100%', height: heightPercentageToDP(3.7), backgroundColor: '#fff', marginTop: verticalScale(10)}}>
                <Text style={[commonStyles.text2, {fontFamily: 'EverydaySansBold', fontSize: moderateScale(9), textAlignVertical: 'center', textAlign: 'center', height: '100%' }]}>See all your membership benefits</Text>
              </View>
              <View style={{ height: verticalScale(500), width: scale(100), borderRadius: scale(200), backgroundColor: '#fdbd31', bottom: verticalScale(120), transform: [{ scaleX: 1.75}], transform: [{rotate: '50deg'}], zIndex: -1, right: scale(150)}}/>
              <View style={{ height: verticalScale(100), width: scale(500), borderRadius: scale(200), backgroundColor: '#fdbd31', bottom: verticalScale(700), transform: [{ scaleY: 1.75}], transform: [{rotate: '30deg'}], zIndex: -1, left: scale(200)}}/>
            </View>
            <View style={{height: heightPercentageToDP(11), flexDirection: 'row', justifyContent: 'space-between', elevation: 2, backgroundColor: '#fff', borderRadius: moderateScale(6), padding: moderateScale(10)}}>
              <View style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', width: '60%', height: '100%'}}>              
                <View style={{ flexDirection: 'column', justifyContent: 'flex-start', rowGap: verticalScale(2), alignItems: 'flex-start'}}>
                  <Text style={[commonStyles.titleText, {fontSize: moderateScale(11), color: '#01143cff', marginTop: verticalScale(5), }]}>Store map</Text>
                  <Text style={[styles.itemText, {fontSize: moderateScale(8), marginBottom: verticalScale(5)}]}>Easily find everything you need fast in the store.</Text>
                </View>
                <View style={[commonStyles.button, {elevation: 0, marginLeft: scale(5), width: scale(80), height: verticalScale(20)}]}>
                  <Text style={[commonStyles.buttonText, { fontSize: moderateScale(9.5), color: '#fff'}]}>View map</Text>
                </View>
              </View>
              <View style={{width: '40%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                <CoronaM width={'100%'} height={'70%'} />
              </View>
            </View>
          </ScrollView>
      </View>
      </Modal>
              <Animated.View style={[styles.footer, footerStyle, {position: 'absolute', bottom: 0, left: 0, right: 0}]}>
                  <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', height: '100%'}}>
                      <ShopFilled width={moderateScale(16)} height={moderateScale(16)}/>
                      <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(8.5), color: '#0053e2'}} >Shop</Text>
                  </View>
                <Pressable onPress={() => navigation.navigate('ItemsScreen', { randomFirstName: randomFirstName || '', randomName: randomName || ''  })}>
                  <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', height: '100%'}}>
                      <ItemsOutline width={moderateScale(16)} height={moderateScale(16)}/>
                      <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(8.5), color: '#4d4d4d'}} >My Items</Text>
                  </View>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('SearchScreen', { randomFirstName: randomFirstName || '', randomName: randomName || ''  })}>
                  <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around',  height: '100%'}}>
                      <Sparky width={moderateScale(16)} height={moderateScale(16)}/>
                      <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(8.5), color: '#4d4d4d'}} >Ask Sparky</Text>
                  </View>
                </Pressable>
                <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', height: '100%'}}>
                    <ServicesOutline width={moderateScale(16)} height={moderateScale(16)}/>
                    <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(8.5), color: '#4d4d4d'}} >Benefits</Text>
                </View>
                <Pressable onPress={() => navigation.navigate('AccountScreen', { randomFirstName: randomFirstName || '', randomName: randomName || '' })}>
                  <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', height: '100%'}}>
                      <AccountOutline width={moderateScale(16)} height={moderateScale(16)}/>
                      <Text style={{fontFamily: 'EverydaySansRegular', fontSize: moderateScale(8.5), color: '#4d4d4d'}} >Account</Text>
                  </View>
                </Pressable>
              </Animated.View>
    </View>
    
  );
}

const styles = StyleSheet.create({
  exitPassBottomContainer: {
    alignItems: 'center',
    justifyContent: 'center',                                                                                                                                                                                                                                                                                                                                                                           
    backgroundColor: '#fff',
    elevation: 4,
    padding: moderateScale(10),
    bottom: verticalScale(5),
    borderStartEndRadius: moderateScale(5),
    borderStartStartRadius: moderateScale(6),
    borderEndEndRadius: moderateScale(6),
    borderEndStartRadius: moderateScale(5),
    width: '100%',
    height: '75%',
    borderColor: '#fff',
    borderWidth: scale(0.5),
    borderTopWidth: 0
  },
  itemText: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    color: '#000',
    fontFamily: 'EverydaySansRegular',
    fontSize: moderateScale(10),
    textAlign: 'left'
  },
    exitPassText: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    color: '#0053e2',
    fontFamily: 'EverydaySansBold',
    fontSize: moderateScale(11),
    left: scale(10),
    textAlign: 'left'
  },
    tc: {
    bottom: verticalScale(5),
    fontFamily: 'EverydaySansRegular',
    fontSize: moderateScale(9),
    textDecorationLine: 'underline',
  },
    exitPassText2: {
    color: '#0053e2',
    fontFamily: 'EverydaySansBlackItalic',
    fontSize: moderateScale(10),
    left: scale(10),
    textAlign: 'flex-start'
  },
  exitPassTopContainer: {
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',                                                                                                                                                                                                                                                                                                                                                                           
    backgroundColor: '#fff',
    borderStartEndRadius: moderateScale(4),
    borderStartStartRadius: moderateScale(8),
    borderEndEndRadius: moderateScale(4),
    borderEndStartRadius: moderateScale(8),
    width: '100%',
    borderBottomWidth: 0,
    flexDirection: 'column',
    height: '25%',
    padding: moderateScale(5)
  },
  banner: {
    backgroundColor: '#0053e2',
    flexDirection: 'row',
    height: verticalScale(20),
    justifyContent: 'space-around',
    left: 0,
    position: 'absolute',
    right: 0,
    top: verticalScale(140),
    width: '100%',
  },
  bannerBoldText: {
    color: '#fff',
    fontFamily: 'EverydaySansBold',
    fontSize: 16,
    top: 63,
  },
  bannerText: {
    color: '#fff',
    fontFamily: 'EverydaySansRegular',
    fontSize: 16,
    top: 63,
  },
  body: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginBottom: verticalScale(10),
  },
  button: {
    backgroundColor: '#004f9a',
    borderRadius: 5,
    marginTop: verticalScale(20),
    padding: moderateScale(10),
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'EverydaySansMedium',
    fontSize: moderateScale(14),
  },
  container: {
    backgroundColor: '#0053e2',
    flex: 1,
    height: heightPercentageToDP(100),
    width: widthPercentageToDP(100),
    zIndex: 1
  },
    footer: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: moderateScale(0.13),
        bottom: 0,
        elevation: 5,
        flexDirection: 'row',
        height: heightPercentageToDP(4.5),
        justifyContent: 'space-between',
        columnGap: scale(20),
        paddingVertical: verticalScale(5),
        paddingLeft: scale(16),
        paddingRight: scale(16),
        width: '100%',
      },
  headerText: {
    color: '#fff',
    fontFamily: 'EverydaySansBold',
    fontSize: moderateScale(20),
    textAlign: 'center',
  },
  storeDetails: {
    color: '#555',
    fontFamily: 'EverydaySansRegular',
    fontSize: moderateScale(14),
    marginBottom: verticalScale(5),
  },
  storeText: {
    fontFamily: 'EverydaySansBold',
    fontSize: moderateScale(18),
    marginBottom: verticalScale(10),
  },
});
