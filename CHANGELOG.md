# Changelog

## [0.8.1](https://github.com/nekusu/apetype/compare/v0.8.0...v0.8.1) (2024-09-25)


### Internal Updates

* fix production workflow ([5f209b9](https://github.com/nekusu/apetype/commit/5f209b94896ebddc31a39e86907abe6af739be9f))

## [0.8.0](https://github.com/nekusu/apetype/compare/v0.7.1...v0.8.0) (2024-09-24)


### New Features

* add account page ([#41](https://github.com/nekusu/apetype/issues/41)) ([7838673](https://github.com/nekusu/apetype/commit/7838673ace68e1b68abb83e8bb985a57e0540463))
* add blur effect to user page background ([32fc5d1](https://github.com/nekusu/apetype/commit/32fc5d18308969f7be5412efdce544259ae7bc02))
* add personal best tables ([a4a05cc](https://github.com/nekusu/apetype/commit/a4a05ccd5fd3c2affb6222ee5d186fb069ad9a7c))
* add user page ([#42](https://github.com/nekusu/apetype/issues/42)) ([86e1a06](https://github.com/nekusu/apetype/commit/86e1a0601a568f5d672de9107bdd2a764bce7e15))
* image compression ([cedf7cd](https://github.com/nekusu/apetype/commit/cedf7cd31a4a004b1377ca3a1ef634d01a625820))
* save user data before logging out ([210e987](https://github.com/nekusu/apetype/commit/210e98782abaaee83f493ac02adc0ed54c6eb5a5))
* use provider photo as profile picture when registering ([87aab70](https://github.com/nekusu/apetype/commit/87aab70fc6f8e1c0b804ecbdba9ef1203906d3d3))
* **settings:** add reset account setting ([ac7e7c2](https://github.com/nekusu/apetype/commit/ac7e7c251a3dbfdef5f2b37831919f39a93d0af4))
* **settings:** add reset personal bests setting ([0a7c678](https://github.com/nekusu/apetype/commit/0a7c67882cbedf939fbee258c889cdafceca6a04))
* **test:** add sign in button in test result ([7e76d13](https://github.com/nekusu/apetype/commit/7e76d139f831e7e8b099987cf70c46066675103c))
* **test:** add warning for RTL languages ([2289bb7](https://github.com/nekusu/apetype/commit/2289bb7a23eb25188e701b22cca2fafdfd22d9f4))
* **test:** afk detection ([d18c7a6](https://github.com/nekusu/apetype/commit/d18c7a61adfae13e9fea002d5697e2788c18f485))


### Bug Fixes

* check for used names when changing username ([fe806cb](https://github.com/nekusu/apetype/commit/fe806cbe4cf2e0d0d0c4795bf5b6fd8aacfcf411))
* crash when user finishes test ([7910fac](https://github.com/nekusu/apetype/commit/7910fac7c97643f5918dc9831c2160892c726dec))
* error deleting cached data ([a253da8](https://github.com/nekusu/apetype/commit/a253da8321ec5281bd82fb71767b34a58310e546))
* id generation not working in android browsers ([96b453c](https://github.com/nekusu/apetype/commit/96b453c06fb8a0a738b32e8cfd1129efd838f70d))
* persistent cache not clearing when option was enabled ([3816ea2](https://github.com/nekusu/apetype/commit/3816ea2736a8de8d949630dcc1353a004b8790ef))
* test history not deleted from the server when a user account is deleted ([5333b8b](https://github.com/nekusu/apetype/commit/5333b8bfefabbd70b8623e33b3db5ba79cc06b4d))
* use a different name when registering with providers if the username is already in use ([3c119e6](https://github.com/nekusu/apetype/commit/3c119e69e4fde9ba278b7ea96a63687c9a4b5f77))
* wrong personal bests and table order ([fef41c3](https://github.com/nekusu/apetype/commit/fef41c3a16bb9976a6d1a8e9494cb43be27347d5))


### Internal Updates

* create LICENSE ([eb89484](https://github.com/nekusu/apetype/commit/eb894840283a13f77659bdfafc6fb0c8f16a73e0))
* replace pnpm with bun package manager ([3c2296d](https://github.com/nekusu/apetype/commit/3c2296d776b4aac3dc488cd57617b9ca9d25e39f))
* update dependencies ([471107e](https://github.com/nekusu/apetype/commit/471107ef5517a45540d2bd9b8f81111bd811c49e))
* **deps:** replace prettier with biome ([4da30d1](https://github.com/nekusu/apetype/commit/4da30d1257514ad8ee59c288082c4aba626a1951))
* **deps:** update dependencies ([6cf2f5a](https://github.com/nekusu/apetype/commit/6cf2f5afd18674e03eeb610f2640557a9a61a5a7))
* **deps:** update dependencies ([#43](https://github.com/nekusu/apetype/issues/43)) ([e03861d](https://github.com/nekusu/apetype/commit/e03861d7d64ff539932fb543d0a2a65ac45cb82a))
* change SWR global config ([9164aa7](https://github.com/nekusu/apetype/commit/9164aa7bf5e9fe8476c84f25ea0ae80ef9071b2c))
* clean code ([2e92320](https://github.com/nekusu/apetype/commit/2e92320f9cad88186d6111b03ab5127115f3b823))
* fix and improve user data saving ([#44](https://github.com/nekusu/apetype/issues/44)) ([5f8b6be](https://github.com/nekusu/apetype/commit/5f8b6bef4a87abc8ac16ec903e530ce1f5b7e8da))
* improve firebase utils ([be68df2](https://github.com/nekusu/apetype/commit/be68df2ecf6887fc04d13e9aa60b0bc50252b582))
* improve removal of cached user data ([0a945ac](https://github.com/nekusu/apetype/commit/0a945ac0acac76412382dfdeb0a6ba4b08a879ea))
* migrate from Firebase to Supabase ([#47](https://github.com/nekusu/apetype/issues/47)) ([b5fd725](https://github.com/nekusu/apetype/commit/b5fd725efddb8bcb2c4e6e5f6d3e0fd45d76c019))
* minor refactoring ([fdbe9e6](https://github.com/nekusu/apetype/commit/fdbe9e6f65f6fc17fd6d3f4dbc6b650d99b9458f))
* redirect to account route if user signs in ([a448d36](https://github.com/nekusu/apetype/commit/a448d36f9840677c09a92ef2e0f1856c91fd5cbe))
* remove Group component from `core` and improve its structure ([eec74c5](https://github.com/nekusu/apetype/commit/eec74c5f111abfb877318818db76349caef416cc))
* remove unnecessary useMemo in useWords ([5e571e3](https://github.com/nekusu/apetype/commit/5e571e3ced2c391c2b7f2964c3853bb0dc917bd3))
* replace eslint with biome ([8cf3d20](https://github.com/nekusu/apetype/commit/8cf3d20662e6e677a0ed922cccaddbe46cae7615))
* replace unocss with tailwindcss v4 ([527d30c](https://github.com/nekusu/apetype/commit/527d30c8f3b077b63e73b047be0fdad2f31793ab))
* replace zod with valibot ([9380d09](https://github.com/nekusu/apetype/commit/9380d09993ca3aa6be88f80aee01b51b13bf2f68))
* **core:** change modal border radius ([4a929e5](https://github.com/nekusu/apetype/commit/4a929e57dbf964cd7777f7844e825b5da6a98c77))
* **test:** lazy load chart ([bcefe38](https://github.com/nekusu/apetype/commit/bcefe38155c59d8ac315a157210edc2ccb9819df))
* **test:** make Chart component reusable ([ef31cb7](https://github.com/nekusu/apetype/commit/ef31cb7d173006616e1d25f3e189208106de21af))

## [0.7.1](https://github.com/nekusu/apetype/compare/v0.7.0...v0.7.1) (2023-08-30)


### Bug Fixes

* new version toast not showing ([19e786f](https://github.com/nekusu/apetype/commit/19e786f5a8cb2ed3941b579ce765d924f20b91c5))
* **cli:** custom themes with the same name not displaying correctly ([fb7f947](https://github.com/nekusu/apetype/commit/fb7f947605dcc9e76aab3fe0a8acfc70c61cd7f4))
* **settings:** wrong validation of settings when test is set to infinite ([2a3a388](https://github.com/nekusu/apetype/commit/2a3a38844e8535bf3b6b74b7f842491c9d2b7d77))
* **test:** inability to stop infinite test ([980a026](https://github.com/nekusu/apetype/commit/980a02634192d5f7625bf8b41488cb1aa14c9e0f))
* **test:** words stuck after setting test to infinite ([076a418](https://github.com/nekusu/apetype/commit/076a418eba83e275fbedf1c5e9cbdbf28c4f9077))

## [0.7.0](https://github.com/nekusu/apetype/compare/v0.6.0...v0.7.0) (2023-08-30)


### New Features

* add loading UI ([3af1643](https://github.com/nekusu/apetype/commit/3af16434674b44113e52b36e0d67fb092ed93bd0))
* add toast notifications ([#39](https://github.com/nekusu/apetype/issues/39)) ([dcc32c0](https://github.com/nekusu/apetype/commit/dcc32c00b455c85386473fdb9aa1e5fbf2225669))
* add user authentication ([#40](https://github.com/nekusu/apetype/issues/40)) ([d336676](https://github.com/nekusu/apetype/commit/d3366765fb898d664559f908cc42932c03c136dc))
* **settings:** add authentication methods setting ([38bb649](https://github.com/nekusu/apetype/commit/38bb6494193c99ac2572c43475e63f13f81613ee))
* **settings:** add delete account setting ([4f376f3](https://github.com/nekusu/apetype/commit/4f376f39dc6f858bdcc15d53dacc56115ed263cb))
* **settings:** add password authentication setting ([b418bc1](https://github.com/nekusu/apetype/commit/b418bc142fd93aa44e560eb9f1b481e6d9555b2d))
* **theme:** add AI theme generation ([9325d85](https://github.com/nekusu/apetype/commit/9325d85ff78b8d7e0f807de80aacadfa6839e94c))
* **theme:** add css color variable validation ([5024090](https://github.com/nekusu/apetype/commit/502409023533d4d86fd69df68d541c6c09c68603))
* **theme:** add eyedropper color selection ([5c8a5b3](https://github.com/nekusu/apetype/commit/5c8a5b3f9d8267ad18e2598c1d833716791ca51d))
* **theme:** show restore theme toast after deletion ([32d0db6](https://github.com/nekusu/apetype/commit/32d0db6ee3166dfcfeada07180fa0912c45eedbb))


### Bug Fixes

* **core:** tooltip not visible when modal is open ([dddf90c](https://github.com/nekusu/apetype/commit/dddf90c9b19f6bb86f05df240f4759b9c3b7d520))
* **test:** css color variables not showing in chart ([2306f50](https://github.com/nekusu/apetype/commit/2306f50c174d88d077dc545107ee145b6007d66f))
* **test:** test words not getting focus after closing modal ([24abd8f](https://github.com/nekusu/apetype/commit/24abd8f4c05c603f85830648c38500372c0f9d3f))

## [0.6.0](https://github.com/nekusu/apetype/compare/v0.5.0...v0.6.0) (2023-08-11)


### New Features

* add keymap in typing test ([#33](https://github.com/nekusu/apetype/issues/33)) ([736b114](https://github.com/nekusu/apetype/commit/736b114338356d1d4a5a649daa5fbb702ea36efe))
* add typing sounds ([#30](https://github.com/nekusu/apetype/issues/30)) ([7dbe9b4](https://github.com/nekusu/apetype/commit/7dbe9b46f73ec7d957d378ee6c1273b520542d40))
* **settings:** add blind mode setting ([ae042f3](https://github.com/nekusu/apetype/commit/ae042f37bd1f6edbdc7e1b92da1d8089057ee34b))
* **settings:** add freedom mode setting ([01bfea4](https://github.com/nekusu/apetype/commit/01bfea4362266ccbc41ce9f78b6381987f684aca))
* **settings:** add import/export settings ([#34](https://github.com/nekusu/apetype/issues/34)) ([d6d10f3](https://github.com/nekusu/apetype/commit/d6d10f3e8e6208420983be66529703e027578578))
* **settings:** add lazy mode setting ([e87d0d4](https://github.com/nekusu/apetype/commit/e87d0d406ae9da5625a03b4ff4fce46dfcf50966))
* **settings:** add persistent cache setting ([#32](https://github.com/nekusu/apetype/issues/32)) ([085f0be](https://github.com/nekusu/apetype/commit/085f0be4a1bda9bb429bce364a5e2aee64e44f2e))
* **settings:** add reset button ([#31](https://github.com/nekusu/apetype/issues/31)) ([d4a76a4](https://github.com/nekusu/apetype/commit/d4a76a404c64d249720c1cba5a4c9d13f89e1d62))
* **settings:** add stop on error setting ([568fc60](https://github.com/nekusu/apetype/commit/568fc609b86e7839dbcaae0b6f20cf2db4f7912a))
* **settings:** add strict space setting ([20e8056](https://github.com/nekusu/apetype/commit/20e80569d4336148ddb2fccde2b69b588e5454ab))
* **settings:** improve settings validation ([#36](https://github.com/nekusu/apetype/issues/36)) ([a8e6600](https://github.com/nekusu/apetype/commit/a8e66009d9a495bc28377e663683ea931a8c621e))
* **test:** add screenshot button to result page ([#35](https://github.com/nekusu/apetype/issues/35)) ([57bf528](https://github.com/nekusu/apetype/commit/57bf52846b4a36ea9ec5173cec389bb93e5b5335))


### Performance Improvements

* implement local storage cache compression ([#29](https://github.com/nekusu/apetype/issues/29)) ([635b9e8](https://github.com/nekusu/apetype/commit/635b9e8d67b2fe976da214e7d227729a2e73d739))


### Bug Fixes

* wrong background color on screenshot ([8d0ef6d](https://github.com/nekusu/apetype/commit/8d0ef6d61f5c9f581015daa42291ec196a29b6d3))
* **keymap:** 'show top row' setting not working ([fa4d335](https://github.com/nekusu/apetype/commit/fa4d335a2078a9b0fca55858e66997a01180f4bd))
* **keymap:** keys not activating when pressed ([99dc0cd](https://github.com/nekusu/apetype/commit/99dc0cdf4faf5d9d456983d5cb74079ed0b92e65))

## [0.5.0](https://github.com/nekusu/apetype/compare/v0.4.0...v0.5.0) (2023-04-12)


### New Features

* add color analysis and validation in theme editor ([#26](https://github.com/nekusu/apetype/issues/26)) ([653b2ef](https://github.com/nekusu/apetype/commit/653b2ef6d53b7162c32208c061eacd480b63de88))
* add theme and language caching ([#27](https://github.com/nekusu/apetype/issues/27)) ([70092e9](https://github.com/nekusu/apetype/commit/70092e95ec36b2693a4106ebfbe2e33edfe0ac53))
* add validation and error handling in Input component ([e647ec7](https://github.com/nekusu/apetype/commit/e647ec7c7cddfe74a288e7df9972f3664e402d47))
* animate logo icon on every test restart ([f943c2a](https://github.com/nekusu/apetype/commit/f943c2ac89502a7984191430af65e4af0afe712a))
* replace native color input with custom color picker ([#25](https://github.com/nekusu/apetype/issues/25)) ([fbc76bf](https://github.com/nekusu/apetype/commit/fbc76bff533e60ef8a5389391a52d12bb751957d))
* theme randomizer for custom themes ([#23](https://github.com/nekusu/apetype/issues/23)) ([b7f04f5](https://github.com/nekusu/apetype/commit/b7f04f5f87783cf259f9c4c3f7facb26eb49aafd))
* **cli:** add custom theme selection in CLI ([#22](https://github.com/nekusu/apetype/issues/22)) ([875283c](https://github.com/nekusu/apetype/commit/875283c00277c174f086a1ae68545583090107d3))
* **settings:** add custom theme editor ([#18](https://github.com/nekusu/apetype/issues/18)) ([b7193c5](https://github.com/nekusu/apetype/commit/b7193c546990e96e529d0af49863fb4192881b4b))
* **settings:** add randomize theme setting ([#14](https://github.com/nekusu/apetype/issues/14)) ([18113ef](https://github.com/nekusu/apetype/commit/18113ef0d1ae4c87f852805a09db25cf899ee19c))
* **settings:** add theme selection ([#13](https://github.com/nekusu/apetype/issues/13)) ([0acb600](https://github.com/nekusu/apetype/commit/0acb600c64ec5e758dd71ae17da6e2c96771eb9e))
* **test:** add colors and tooltips to character stats test result ([4f7b761](https://github.com/nekusu/apetype/commit/4f7b761b06915e0bb77ddf52abe0a9e65c65f911))


### Performance Improvements

* **cli:** replace fuzzy search library ([#12](https://github.com/nekusu/apetype/issues/12)) ([46fa3e3](https://github.com/nekusu/apetype/commit/46fa3e39f3c55690c4c85254da0f156a3910ebf5))


### Bug Fixes

* **cli:** item tooltips covered by command line modal ([8f68381](https://github.com/nekusu/apetype/commit/8f6838167b7aca7f66279e40d68e7659ed914723))
* **test:** result chart not using custom theme colors ([589b3d2](https://github.com/nekusu/apetype/commit/589b3d2802e6934c4c5a044dd2133014649dc687))

## [0.4.0](https://github.com/nekusu/apetype/compare/v0.3.0...v0.4.0) (2023-02-19)


### New Features

* improve various animations ([#11](https://github.com/nekusu/apetype/issues/11)) ([7e7c461](https://github.com/nekusu/apetype/commit/7e7c461c20152af94f4d7f8b0b47e466ee761d82))
* **cli:** add CLI button to home page ([#7](https://github.com/nekusu/apetype/issues/7)) ([b53b284](https://github.com/nekusu/apetype/commit/b53b28463a9ec431851e25b37f1486f5f96ce5a3))
* **settings:** add hide elements settings ([#10](https://github.com/nekusu/apetype/issues/10)) ([3696cf7](https://github.com/nekusu/apetype/commit/3696cf7893c4d60e84db5978c402d12b2565edd1))
* **settings:** add language setting ([#8](https://github.com/nekusu/apetype/issues/8)) ([cfc1667](https://github.com/nekusu/apetype/commit/cfc166749caccdf14783a00b072be822956c1a52))


### Performance Improvements

* **cli:** virtualize CLI list ([#9](https://github.com/nekusu/apetype/issues/9)) ([6c12d52](https://github.com/nekusu/apetype/commit/6c12d521bbf03aed23caf13d8e808075b8c52c53))


### Bug Fixes

* **cli:** incorrect selected index value ([31fd722](https://github.com/nekusu/apetype/commit/31fd722b1f376c18e913ea3f9bf057d73bdb7b6e))
* **cli:** value input on command line ([#6](https://github.com/nekusu/apetype/issues/6)) ([1f22c37](https://github.com/nekusu/apetype/commit/1f22c37e2f832cb2009db40fab8177a2f469ba80))
* **test:** prevent user input after test finished ([f8638e9](https://github.com/nekusu/apetype/commit/f8638e925e677b8642d13deb22abd4e890a0d7d5))

## [0.3.0](https://github.com/nekusu/apetype/compare/v0.2.0...v0.3.0) (2023-02-18)


### New Features

* **cli:** add command line ([#5](https://github.com/nekusu/apetype/issues/5)) ([c0fb588](https://github.com/nekusu/apetype/commit/c0fb58853bcd24dcb1edc2439f6f0c65cec0ae00))
* **settings:** add font family setting ([#4](https://github.com/nekusu/apetype/issues/4)) ([2c4c853](https://github.com/nekusu/apetype/commit/2c4c85346c2a5aafc3fd83c89d8585f073a38c19))

## [0.2.0](https://github.com/nekusu/apetype/compare/v0.1.0...v0.2.0) (2023-01-20)


### New Features

* **layout:** add version button to footer ([#3](https://github.com/nekusu/apetype/issues/3)) ([3f621d9](https://github.com/nekusu/apetype/commit/3f621d962808ca6e497e8144c5f7a616b980a63b))
* **test:** add result page ([#2](https://github.com/nekusu/apetype/issues/2)) ([938e925](https://github.com/nekusu/apetype/commit/938e92589d7a7a794a2dbeadbe7cc9179aa0427c))


### Bug Fixes

* **test:** incorrect raw wpm stats ([#1](https://github.com/nekusu/apetype/issues/1)) ([31c1a30](https://github.com/nekusu/apetype/commit/31c1a30f9de3c4ee275499f5aa0f884047c73243))

## 0.1.0 (2023-01-17)
