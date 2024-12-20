// import Country from '#models/country'
// import { BaseSeeder } from '@adonisjs/lucid/seeders'

// export default class extends BaseSeeder {
//   async run() {
//     const countries = [
//       {
//         id: '5cdb0410-e247-464e-9443-5239cff311ec',
//         name: 'Grenada',
//         capital: "St. George's",
//       },
//       {
//         id: 'dc293e02-55cc-4298-97c3-4b00a96d4fd3',
//         name: 'Switzerland',
//         capital: 'Bern',
//       },
//       {
//         id: 'c24ab77f-ac2a-4d09-b105-4a4d42a0979d',
//         name: 'Sierra Leone',
//         capital: 'Freetown',
//       },
//       {
//         id: 'e6402489-fdca-4d4b-a130-c38bf9556505',
//         name: 'Hungary',
//         capital: 'Budapest',
//       },
//       {
//         id: '0e2f7343-00f2-455b-9e03-eddd898627ee',
//         name: 'Barbados',
//         capital: 'Bridgetown',
//       },
//       {
//         id: '7d594dab-0eb2-4df4-9d73-b7fe5420df10',
//         name: 'Ivory Coast',
//         capital: 'Yamoussoukro',
//       },
//       {
//         id: '87cc7a95-6476-4132-88eb-798c5ee8ca9a',
//         name: 'Tunisia',
//         capital: 'Tunis',
//       },
//       {
//         id: '1d131f95-fe03-4ac3-8ab8-814de752f427',
//         name: 'Italy',
//         capital: 'Rome',
//       },
//       {
//         id: 'd73b9b99-79cc-41b9-a4ec-598bcb99eaaf',
//         name: 'Benin',
//         capital: 'Porto-Novo',
//       },
//       {
//         id: '3a26bf55-8e71-442f-b18e-7ec587d5c0d1',
//         name: 'Indonesia',
//         capital: 'Jakarta',
//       },
//       {
//         id: '9cfa45d8-d3ec-4ad3-bebd-c3e9fd16f38c',
//         name: 'Cape Verde',
//         capital: 'Praia',
//       },
//       {
//         id: '0d8074d6-bcb6-4031-8f81-825456fe0450',
//         name: 'Saint Kitts and Nevis',
//         capital: 'Basseterre',
//       },
//       {
//         id: '64027d43-380f-48c8-a2c7-0fe1abaf17c3',
//         name: 'Laos',
//         capital: 'Vientiane',
//       },
//       {
//         id: 'f5ee8b68-06cf-4f25-ad31-d2a2cb92cb6d',
//         name: 'Uganda',
//         capital: 'Kampala',
//       },
//       {
//         id: '7fcc85c6-a145-448e-aabf-2158996809c0',
//         name: 'Andorra',
//         capital: 'Andorra la Vella',
//       },
//       {
//         id: 'fb030899-40c6-4335-8d3a-6454a55757a0',
//         name: 'Burundi',
//         capital: 'Gitega',
//       },
//       {
//         id: 'aa9a6f2c-cb44-4d0e-8fd5-0e3cfa279e9a',
//         name: 'South Africa',
//         capital: 'Pretoria',
//       },
//       {
//         id: 'f7f7fc83-2a8a-45fe-9b24-ebe743cb9dbe',
//         name: 'France',
//         capital: 'Paris',
//       },
//       {
//         id: '167ce2c0-9551-41e9-9d54-b7db290b8bf4',
//         name: 'Libya',
//         capital: 'Tripoli',
//       },
//       {
//         id: 'd5d3ac13-1bd7-42a5-a073-7526b14f313c',
//         name: 'Mexico',
//         capital: 'Mexico City',
//       },
//       {
//         id: '6ecfa390-17bd-470b-97ab-115e80db29fd',
//         name: 'Gabon',
//         capital: 'Libreville',
//       },
//       {
//         id: '50674372-0fc2-46f0-b4da-f0a7070a9ef0',
//         name: 'North Macedonia',
//         capital: 'Skopje',
//       },
//       {
//         id: 'df7f6879-1361-4055-9174-3392e6bc803f',
//         name: 'China',
//         capital: 'Beijing',
//       },
//       {
//         id: '228ae328-b5b7-45af-b0ef-13557c02b13b',
//         name: 'Yemen',
//         capital: "Sana'a",
//       },
//       {
//         id: 'a200b840-8de6-4fdf-a17a-1e8c8ac98f60',
//         name: 'Solomon Islands',
//         capital: 'Honiara',
//       },
//       {
//         id: '3d024fd7-053c-42de-9dc6-dc0599aca316',
//         name: 'Uzbekistan',
//         capital: 'Tashkent',
//       },
//       {
//         id: 'fe54bc01-a3f7-47b7-9aa0-8c417af17469',
//         name: 'Egypt',
//         capital: 'Cairo',
//       },
//       {
//         id: '052f931a-e8d2-47dd-a585-70aa2eeeb39f',
//         name: 'Senegal',
//         capital: 'Dakar',
//       },
//       {
//         id: '30ad7fb3-0d5e-41b6-9ff9-8f5110beafe9',
//         name: 'Sri Lanka',
//         capital: 'Sri Jayawardenepura Kotte',
//       },
//       {
//         id: '7b045e25-8abb-431c-8fc0-9252c9d29688',
//         name: 'Bangladesh',
//         capital: 'Dhaka',
//       },
//       {
//         id: '87d4e874-6fe7-4f0c-927b-83d2c4f47fee',
//         name: 'Peru',
//         capital: 'Lima',
//       },
//       {
//         id: 'aa7d6b89-7b3f-48e6-9097-2862f014f422',
//         name: 'Singapore',
//         capital: 'Singapore',
//       },
//       {
//         id: 'dad87636-9845-426c-987d-da0568355488',
//         name: 'Turkey',
//         capital: 'Ankara',
//       },
//       {
//         id: '6834016f-43fc-499d-b9b8-b45600cb9514',
//         name: 'Afghanistan',
//         capital: 'Kabul',
//       },
//       {
//         id: 'c314acee-6c02-4409-b360-0504d639a9cc',
//         name: 'United Kingdom',
//         capital: 'London',
//       },
//       {
//         id: 'e33caf86-069e-4b88-a93f-2bacfc18ba3b',
//         name: 'Zambia',
//         capital: 'Lusaka',
//       },
//       {
//         id: '6b9b84b1-5418-4c76-b2fc-e97c0a1fe8ca',
//         name: 'Finland',
//         capital: 'Helsinki',
//       },
//       {
//         id: '4b02e511-2aa5-42d2-bf70-e6b45085dbf5',
//         name: 'Niger',
//         capital: 'Niamey',
//       },
//       {
//         id: '06f0d71c-37dc-4be9-9ca7-325178433f15',
//         name: 'Guinea-Bissau',
//         capital: 'Bissau',
//       },
//       {
//         id: 'da76f26b-3ced-46ae-ab6f-63462b5c07ae',
//         name: 'Azerbaijan',
//         capital: 'Baku',
//       },
//       {
//         id: '617b10e8-1e45-40e6-a4be-5857c2bed110',
//         name: 'Djibouti',
//         capital: 'Djibouti',
//       },
//       {
//         id: '2f0f38ba-1e04-4a0e-a5e2-5cb6ea505cb3',
//         name: 'North Korea',
//         capital: 'Pyongyang',
//       },
//       {
//         id: '4661a2bc-12c8-4d14-b296-340dec771f49',
//         name: 'Mauritius',
//         capital: 'Port Louis',
//       },
//       {
//         id: '8dbbd6bb-abc0-41e9-bb91-5824b7e12968',
//         name: 'Colombia',
//         capital: 'Bogotá',
//       },
//       {
//         id: '40d86b64-527d-4886-8759-87c8ce5752e5',
//         name: 'Greece',
//         capital: 'Athens',
//       },
//       {
//         id: 'aacba96f-8880-4ba0-9af2-66d466b8dfff',
//         name: 'Croatia',
//         capital: 'Zagreb',
//       },
//       {
//         id: '894ca32a-5451-448b-b78f-4df08a2b60b7',
//         name: 'Morocco',
//         capital: 'Rabat',
//       },
//       {
//         id: '8e04773c-ae1d-4527-84df-208fb078ae2b',
//         name: 'Algeria',
//         capital: 'Algiers',
//       },
//       {
//         id: 'cce55ddd-3d70-4958-96dc-80461eb59774',
//         name: 'Netherlands',
//         capital: 'Amsterdam',
//       },
//       {
//         id: '3a92799d-ed10-46a1-a9bd-ef855d9b3df0',
//         name: 'Sudan',
//         capital: 'Khartoum',
//       },
//       {
//         id: '22a206cd-0608-4094-b77e-d85d63d9a415',
//         name: 'Fiji',
//         capital: 'Suva',
//       },
//       {
//         id: '5a146ba3-2211-485a-8668-9b7a90773aeb',
//         name: 'Liechtenstein',
//         capital: 'Vaduz',
//       },
//       {
//         id: '1d8655cd-7fb9-41a1-9e61-87024e3fcad1',
//         name: 'Nepal',
//         capital: 'Kathmandu',
//       },
//       {
//         id: '7784a41c-4a51-4658-94b3-aa51dae6cde1',
//         name: 'Georgia',
//         capital: 'Tbilisi',
//       },
//       {
//         id: '63f2ccc8-6a11-4ab6-b633-8863d06f4d37',
//         name: 'Pakistan',
//         capital: 'Islamabad',
//       },
//       {
//         id: 'dbdede62-6bbd-436d-beb9-eb4cdbf6c7b7',
//         name: 'Monaco',
//         capital: 'Monaco',
//       },
//       {
//         id: '92695cc1-634d-449e-a24a-3ac3ca9bffc3',
//         name: 'Botswana',
//         capital: 'Gaborone',
//       },
//       {
//         id: '47eacce3-130f-41ec-878c-55e9e1c594ec',
//         name: 'Lebanon',
//         capital: 'Beirut',
//       },
//       {
//         id: '6e33cc45-44f4-461c-8ec7-55a518d2df2b',
//         name: 'Papua New Guinea',
//         capital: 'Port Moresby',
//       },
//       {
//         id: 'ae01c3dc-1552-4750-aebf-7f70db57e7c3',
//         name: 'Dominican Republic',
//         capital: 'Santo Domingo',
//       },
//       {
//         id: '663e3625-e130-411f-befc-5077c0e2c32a',
//         name: 'Qatar',
//         capital: 'Doha',
//       },
//       {
//         id: '243a52f7-8289-4b2c-8198-423fb6cb88c0',
//         name: 'Madagascar',
//         capital: 'Antananarivo',
//       },
//       {
//         id: '703149cc-35e9-4ba4-97a4-9b359d0ff39f',
//         name: 'India',
//         capital: 'New Delhi',
//       },
//       {
//         id: '4325ce8f-3494-4ea7-a26e-627c080ce68f',
//         name: 'Syria',
//         capital: 'Damascus',
//       },
//       {
//         id: 'cd0ad522-df6e-4111-b0b3-17b176a9064f',
//         name: 'Montenegro',
//         capital: 'Podgorica',
//       },
//       {
//         id: 'fed872bc-3d2e-4062-a0a0-00b665e3cedc',
//         name: 'Eswatini',
//         capital: 'Mbabane',
//       },
//       {
//         id: 'b672f95b-110b-4a73-bd9a-126c37aeeb0b',
//         name: 'Paraguay',
//         capital: 'Asunción',
//       },
//       {
//         id: 'c405a30c-d543-45a6-af30-2c65f1aa09ec',
//         name: 'El Salvador',
//         capital: 'San Salvador',
//       },
//       {
//         id: 'a83e17f9-6bcf-4c78-ae52-cc4959671896',
//         name: 'Ukraine',
//         capital: 'Kyiv',
//       },
//       {
//         id: '87d77a57-a98f-48ed-bf24-11c01f47bf07',
//         name: 'Namibia',
//         capital: 'Windhoek',
//       },
//       {
//         id: '2264484e-37ce-4a7f-b822-b12742b3fde1',
//         name: 'United Arab Emirates',
//         capital: 'Abu Dhabi',
//       },
//       {
//         id: 'f3b8ce6e-1eed-4ccb-842b-ec2d65dfbaa3',
//         name: 'Bulgaria',
//         capital: 'Sofia',
//       },
//       {
//         id: 'c7bfeecb-0f81-4526-b5fc-75944cb40c00',
//         name: 'Germany',
//         capital: 'Berlin',
//       },
//       {
//         id: '400a5ea1-c0d5-4f95-b4f9-2aa4dba30154',
//         name: 'Cambodia',
//         capital: 'Phnom Penh',
//       },
//       {
//         id: '93be91fb-6dec-4e00-a2ef-8105e2ffbb14',
//         name: 'Iraq',
//         capital: 'Baghdad',
//       },
//       {
//         id: 'cac0444b-4d75-4068-b1d8-b4c01cc28ac3',
//         name: 'Sweden',
//         capital: 'Stockholm',
//       },
//       {
//         id: 'a55989ea-6a47-4e97-82d1-5cf5716b3e2f',
//         name: 'Cuba',
//         capital: 'Havana',
//       },
//       {
//         id: '2e14da1e-6e11-4456-9c93-4768d646c8e9',
//         name: 'Kyrgyzstan',
//         capital: 'Bishkek',
//       },
//       {
//         id: '9a622ea9-88a9-4589-add2-d535f59e761b',
//         name: 'Russia',
//         capital: 'Moscow',
//       },
//       {
//         id: 'db87cda6-63f9-4083-9c4c-a89fa3c1b1bd',
//         name: 'Malaysia',
//         capital: 'Kuala Lumpur',
//       },
//       {
//         id: '2aaba589-a4eb-45d2-a9af-cd78bd1cf56e',
//         name: 'São Tomé and Príncipe',
//         capital: 'São Tomé',
//       },
//       {
//         id: '93b61c67-dc51-4155-8076-06013626c9c8',
//         name: 'Cyprus',
//         capital: 'Nicosia',
//       },
//       {
//         id: '8d92fb24-0324-48ff-b5c6-fee8330dff75',
//         name: 'Canada',
//         capital: 'Ottawa',
//       },
//       {
//         id: '0c96c1db-dc4c-4c8b-a95d-eaccee659c8e',
//         name: 'Malawi',
//         capital: 'Lilongwe',
//       },
//       {
//         id: '305a69e8-0906-430c-9be7-f6df72c1365a',
//         name: 'Saudi Arabia',
//         capital: 'Riyadh',
//       },
//       {
//         id: '93b98e87-9d55-43e0-a784-12a14668b43e',
//         name: 'Bosnia and Herzegovina',
//         capital: 'Sarajevo',
//       },
//       {
//         id: 'ab5f24ac-5300-4aa8-b543-1ee443b1759d',
//         name: 'Ethiopia',
//         capital: 'Addis Ababa',
//       },
//       {
//         id: '305edccf-08cf-4102-b8a1-40c7dd812551',
//         name: 'Spain',
//         capital: 'Madrid',
//       },
//       {
//         id: '481ec6c5-e060-4cc7-8389-980b033c979f',
//         name: 'Slovenia',
//         capital: 'Ljubljana',
//       },
//       {
//         id: '4bb92493-ad40-4560-810a-095ef3d566b4',
//         name: 'Oman',
//         capital: 'Muscat',
//       },
//       {
//         id: '0ce2957b-cbeb-43b6-8600-fbfc9c3ee6d3',
//         name: 'San Marino',
//         capital: 'City of San Marino',
//       },
//       {
//         id: '4eb83a6e-f668-4946-a104-c7966968ae3b',
//         name: 'Lesotho',
//         capital: 'Maseru',
//       },
//       {
//         id: '68d2df38-7250-47b3-a7c6-eaa74a46388b',
//         name: 'Marshall Islands',
//         capital: 'Majuro',
//       },
//       {
//         id: '28db68b3-91b0-4a81-a252-d13720ad375e',
//         name: 'Iceland',
//         capital: 'Reykjavik',
//       },
//       {
//         id: '450d34c1-b8c0-450c-b221-a1a949da9950',
//         name: 'Luxembourg',
//         capital: 'Luxembourg',
//       },
//       {
//         id: 'e8a4f256-ec7a-4d6a-a7ea-62a5361d40d5',
//         name: 'Argentina',
//         capital: 'Buenos Aires',
//       },
//       {
//         id: 'ffa59639-34e8-4fce-b2c2-512786a0725a',
//         name: 'Nauru',
//         capital: 'Yaren',
//       },
//       {
//         id: '2c9abada-e8ed-474d-8988-0ab331164bd1',
//         name: 'Dominica',
//         capital: 'Roseau',
//       },
//       {
//         id: '29665249-c20d-4fca-a0ed-c68de2a76181',
//         name: 'Costa Rica',
//         capital: 'San José',
//       },
//       {
//         id: 'fbf3b8b7-1a71-44e8-b6d1-1f14ac18cc7f',
//         name: 'Australia',
//         capital: 'Canberra',
//       },
//       {
//         id: 'ccf46f17-6ea1-442e-a4c0-3982b8fad27c',
//         name: 'Thailand',
//         capital: 'Bangkok',
//       },
//       {
//         id: 'ee79e953-4a65-4453-8dda-6cb0b1c4dbe7',
//         name: 'Haiti',
//         capital: 'Port-au-Prince',
//       },
//       {
//         id: 'aba69a8f-a936-4cd0-967e-4f4733ce5bdd',
//         name: 'Tuvalu',
//         capital: 'Funafuti',
//       },
//       {
//         id: '7da00bc4-6429-4460-a0a6-4f2301b99807',
//         name: 'Honduras',
//         capital: 'Tegucigalpa',
//       },
//       {
//         id: 'd7464394-bea1-4341-9d79-cf5b220eff31',
//         name: 'Equatorial Guinea',
//         capital: 'Malabo',
//       },
//       {
//         id: 'ca8dba6c-38d0-4b6f-b718-d933cc51503f',
//         name: 'Saint Lucia',
//         capital: 'Castries',
//       },
//       {
//         id: '9a4166cc-6f64-4f5f-ab7b-db2a6dcd853b',
//         name: 'Belarus',
//         capital: 'Minsk',
//       },
//       {
//         id: '0a64ae78-ba74-4819-9f22-f15fa82594a3',
//         name: 'Latvia',
//         capital: 'Riga',
//       },
//       {
//         id: 'bb4ed043-a693-446b-985e-44b499a95ab4',
//         name: 'Palau',
//         capital: 'Ngerulmud',
//       },
//       {
//         id: '0e31c6e0-bd7b-4e3c-9a3d-3732705c30d7',
//         name: 'Philippines',
//         capital: 'Manila',
//       },
//       {
//         id: 'b2cb8e99-3202-400a-99ad-34bd7b333b7d',
//         name: 'Denmark',
//         capital: 'Copenhagen',
//       },
//       {
//         id: 'cf5a4eff-37fa-44a9-84cd-277bb3a4243c',
//         name: 'Cameroon',
//         capital: 'Yaoundé',
//       },
//       {
//         id: '2b893296-4ed3-4b59-b832-cee635f34983',
//         name: 'Guinea',
//         capital: 'Conakry',
//       },
//       {
//         id: '5006b3a9-61a0-484c-b446-3aeb6e86ca38',
//         name: 'Bahrain',
//         capital: 'Manama',
//       },
//       {
//         id: '1e44947e-bcb0-4271-a0c1-29b0f23a610f',
//         name: 'Suriname',
//         capital: 'Paramaribo',
//       },
//       {
//         id: '900a2761-14b9-4022-9cd6-002626edd6ac',
//         name: 'DR Congo',
//         capital: 'Kinshasa',
//       },
//       {
//         id: '2d226382-fb12-41b2-8c94-823b215cf3ff',
//         name: 'Somalia',
//         capital: 'Mogadishu',
//       },
//       {
//         id: '205a2d78-27f0-4a8a-8984-bd13ca599ee0',
//         name: 'Czechia',
//         capital: 'Prague',
//       },
//       {
//         id: 'b3790860-cdc2-4c28-b16f-97c78c6c5558',
//         name: 'Vanuatu',
//         capital: 'Port Vila',
//       },
//       {
//         id: 'daa5ef00-1b9d-430a-a423-10770449e24f',
//         name: 'Togo',
//         capital: 'Lomé',
//       },
//       {
//         id: '35d43e0f-d226-465d-a202-c2f133a49a45',
//         name: 'Kenya',
//         capital: 'Nairobi',
//       },
//       {
//         id: '7d27d36a-c2c2-4b5d-a171-72fc19558065',
//         name: 'Rwanda',
//         capital: 'Kigali',
//       },
//       {
//         id: '411d8524-c09b-439d-a31c-33f70518245b',
//         name: 'Estonia',
//         capital: 'Tallinn',
//       },
//       {
//         id: '25d6bb09-0887-4c2f-8bc8-72ccafa4a26a',
//         name: 'Romania',
//         capital: 'Bucharest',
//       },
//       {
//         id: '267e96e6-4f62-450a-9d6f-77615b6090ab',
//         name: 'Trinidad and Tobago',
//         capital: 'Port of Spain',
//       },
//       {
//         id: 'd2be0e93-d839-4458-91fc-69be54898074',
//         name: 'Guyana',
//         capital: 'Georgetown',
//       },
//       {
//         id: '8a9f48a6-f8b6-44eb-bf03-598c3c059b20',
//         name: 'Timor-Leste',
//         capital: 'Dili',
//       },
//       {
//         id: 'e2d14ff8-6461-4e8d-8ba1-81cb38ec76a8',
//         name: 'Vietnam',
//         capital: 'Hanoi',
//       },
//       {
//         id: '7349aa42-1ec8-4a14-8404-22110d6bdd64',
//         name: 'Uruguay',
//         capital: 'Montevideo',
//       },
//       {
//         id: 'f847b6a2-883f-42d0-936f-47cd48e07db2',
//         name: 'Vatican City',
//         capital: 'Vatican City',
//       },
//       {
//         id: 'bb95f96b-d928-45c6-a6fe-c8002624290f',
//         name: 'Austria',
//         capital: 'Vienna',
//       },
//       {
//         id: '4f54e6c1-c12f-40af-86bb-bb39bfa99b25',
//         name: 'Antigua and Barbuda',
//         capital: "Saint John's",
//       },
//       {
//         id: '1923fcc7-44c8-458d-b648-3ca79bfb38fe',
//         name: 'Turkmenistan',
//         capital: 'Ashgabat',
//       },
//       {
//         id: '2c95161c-1b33-4da1-94c7-aa4d787f100d',
//         name: 'Mozambique',
//         capital: 'Maputo',
//       },
//       {
//         id: 'd9a2f96f-56e5-4489-9354-c4f104ba3891',
//         name: 'Panama',
//         capital: 'Panama City',
//       },
//       {
//         id: '29afc018-8c87-42e8-96c5-10ccad48c80a',
//         name: 'Micronesia',
//         capital: 'Palikir',
//       },
//       {
//         id: '5e087786-7c5c-4383-8f7b-b34103d8feee',
//         name: 'Ireland',
//         capital: 'Dublin',
//       },
//       {
//         id: '408730da-8d30-4cca-a27a-47b2228fc4e6',
//         name: 'Norway',
//         capital: 'Oslo',
//       },
//       {
//         id: 'd08e1a5c-7821-4c83-b417-9d026fff21da',
//         name: 'Central African Republic',
//         capital: 'Bangui',
//       },
//       {
//         id: '5ccf75dd-2460-41ce-9eea-96a1a8579458',
//         name: 'Burkina Faso',
//         capital: 'Ouagadougou',
//       },
//       {
//         id: '789e2354-ad8a-42a0-913a-0b733575d19b',
//         name: 'Eritrea',
//         capital: 'Asmara',
//       },
//       {
//         id: '5b457ac2-a346-4754-8e4d-f54c5f308c07',
//         name: 'Tanzania',
//         capital: 'Dodoma',
//       },
//       {
//         id: '3c90550c-3448-4f80-a6ae-02e325c1438c',
//         name: 'South Korea',
//         capital: 'Seoul',
//       },
//       {
//         id: '389035b1-762c-4570-a2ef-910c1cb7f135',
//         name: 'Jordan',
//         capital: 'Amman',
//       },
//       {
//         id: '863b2dae-ea9c-485d-a7c4-2fe547c8c6dc',
//         name: 'Mauritania',
//         capital: 'Nouakchott',
//       },
//       {
//         id: '1287f7a3-4589-4909-81fe-fdc5181fe7d7',
//         name: 'Lithuania',
//         capital: 'Vilnius',
//       },
//       {
//         id: 'e1f9fc03-c737-4181-ae36-8e23a4c60479',
//         name: 'Slovakia',
//         capital: 'Bratislava',
//       },
//       {
//         id: '2ff848dd-78dd-464b-b4ba-63be7b5a4175',
//         name: 'Angola',
//         capital: 'Luanda',
//       },
//       {
//         id: '823537b1-3988-4854-9d57-43010a248242',
//         name: 'Kazakhstan',
//         capital: 'Nur-Sultan',
//       },
//       {
//         id: '24d6719e-ee43-42c0-8f38-bb1c41d234c1',
//         name: 'Moldova',
//         capital: 'Chișinău',
//       },
//       {
//         id: '9a84afc0-3074-41f4-a58c-d396e19ae0a4',
//         name: 'Mali',
//         capital: 'Bamako',
//       },
//       {
//         id: 'c61d33ee-c10c-404e-8ba9-2cbe4073393e',
//         name: 'Armenia',
//         capital: 'Yerevan',
//       },
//       {
//         id: '4dc18205-4076-4e0f-bdad-b41ae0428757',
//         name: 'Samoa',
//         capital: 'Apia',
//       },
//       {
//         id: '28957043-2cb6-4874-827d-633a8e696b99',
//         name: 'Japan',
//         capital: 'Tokyo',
//       },
//       {
//         id: 'e843db46-db70-4707-98f5-59a8c0f9b211',
//         name: 'Bolivia',
//         capital: 'Sucre',
//       },
//       {
//         id: 'f33c3fd2-361f-4f5b-b688-6ba6f6f784a0',
//         name: 'Chile',
//         capital: 'Santiago',
//       },
//       {
//         id: '5a44b236-39ee-4732-b7f1-e674cb268b14',
//         name: 'United States',
//         capital: 'Washington, D.C.',
//       },
//       {
//         id: 'd2ccc3fa-2784-494f-9c4e-463901b65ad3',
//         name: 'Saint Vincent and the Grenadines',
//         capital: 'Kingstown',
//       },
//       {
//         id: '8654f020-b698-4eee-99dc-4024719a3a79',
//         name: 'Seychelles',
//         capital: 'Victoria',
//       },
//       {
//         id: '60fde96b-0f31-45da-9406-3c549d27713c',
//         name: 'Guatemala',
//         capital: 'Guatemala City',
//       },
//       {
//         id: '386b5b98-feba-4bbb-bace-1de00c970746',
//         name: 'Ecuador',
//         capital: 'Quito',
//       },
//       {
//         id: '8a5585ea-6a81-4ad8-bce3-c018e045586d',
//         name: 'Tajikistan',
//         capital: 'Dushanbe',
//       },
//       {
//         id: '2897f20f-f3be-498d-a4a4-8c0080af9d90',
//         name: 'Malta',
//         capital: 'Valletta',
//       },
//       {
//         id: '4f27cc34-f4be-4b33-a21b-d1ec802ac601',
//         name: 'Gambia',
//         capital: 'Banjul',
//       },
//       {
//         id: '026df723-23b1-4669-a866-0081cc21d11d',
//         name: 'Nigeria',
//         capital: 'Abuja',
//       },
//       {
//         id: '53ac29d3-4f73-4a6c-99dd-ed049cd2bf97',
//         name: 'Bahamas',
//         capital: 'Nassau',
//       },
//       {
//         id: 'da3da85c-eab1-4459-9c63-92b026cad0bc',
//         name: 'Kuwait',
//         capital: 'Kuwait City',
//       },
//       {
//         id: '962fede5-95d0-4844-a197-a6725c2fac5c',
//         name: 'Maldives',
//         capital: 'Malé',
//       },
//       {
//         id: '8c797216-efbe-4f1d-aea7-cab1d11b6207',
//         name: 'South Sudan',
//         capital: 'Juba',
//       },
//       {
//         id: '82f4ce58-ae33-4fc8-8b47-1f8378df5434',
//         name: 'Iran',
//         capital: 'Tehran',
//       },
//       {
//         id: '2396233b-0974-4931-86af-2452ff27178b',
//         name: 'Albania',
//         capital: 'Tirana',
//       },
//       {
//         id: '919be23e-7f2d-4d44-be68-af02f0aea518',
//         name: 'Brazil',
//         capital: 'Brasília',
//       },
//       {
//         id: '37d2d3f7-32d4-40fb-896f-d582ad36985f',
//         name: 'Serbia',
//         capital: 'Belgrade',
//       },
//       {
//         id: '9c080e53-5ad2-4592-8543-bdfa91fc820b',
//         name: 'Belize',
//         capital: 'Belmopan',
//       },
//       {
//         id: 'f7223655-5ca2-417b-9928-c827e9c23383',
//         name: 'Myanmar',
//         capital: 'Naypyidaw',
//       },
//       {
//         id: 'cf76673a-eb3b-487e-a066-eef0d3fc0099',
//         name: 'Bhutan',
//         capital: 'Thimphu',
//       },
//       {
//         id: 'bbd68e0f-1169-4e15-8130-176ef934317d',
//         name: 'Venezuela',
//         capital: 'Caracas',
//       },
//       {
//         id: 'ca6e350e-1af2-45a5-aca0-e7432137a309',
//         name: 'Liberia',
//         capital: 'Monrovia',
//       },
//       {
//         id: 'cb43c06d-2b7a-432d-b4c7-0a19bc166b1a',
//         name: 'Jamaica',
//         capital: 'Kingston',
//       },
//       {
//         id: 'a7b53d3c-eacb-4350-8b7c-190b5fdcd59e',
//         name: 'Poland',
//         capital: 'Warsaw',
//       },
//       {
//         id: '9732b0ec-e957-4a29-8499-757c5f60678a',
//         name: 'Brunei',
//         capital: 'Bandar Seri Begawan',
//       },
//       {
//         id: '912d078b-cdf0-4805-b8c0-ff47577c3156',
//         name: 'Comoros',
//         capital: 'Moroni',
//       },
//       {
//         id: 'e52900ec-f47b-4d9e-9d50-41712b0317b2',
//         name: 'Tonga',
//         capital: "Nuku'alofa",
//       },
//       {
//         id: '51fe8bf2-8d58-4190-b6df-8519bab3464f',
//         name: 'Kiribati',
//         capital: 'South Tarawa',
//       },
//       {
//         id: '1c35cd6a-132a-4946-9b44-298a3864e3f5',
//         name: 'Ghana',
//         capital: 'Accra',
//       },
//       {
//         id: '07dcbcc3-3e89-4627-a83b-4a2fe1a16a39',
//         name: 'Chad',
//         capital: "N'Djamena",
//       },
//       {
//         id: 'e818d261-4cfa-40fd-91f2-2315b21c4596',
//         name: 'Zimbabwe',
//         capital: 'Harare',
//       },
//       {
//         id: '3e25e666-0320-4d89-84cc-6602a1aed565',
//         name: 'Mongolia',
//         capital: 'Ulan Bator',
//       },
//       {
//         id: '25d024d9-5745-4cfb-9867-2ac17c4fe4b1',
//         name: 'Portugal',
//         capital: 'Lisbon',
//       },
//       {
//         id: '05caa04b-eea0-4680-8103-880c67b672d8',
//         name: 'Republic of the Congo',
//         capital: 'Brazzaville',
//       },
//       {
//         id: '2de4031a-b3ec-4c82-b41b-a0c7edd44755',
//         name: 'Belgium',
//         capital: 'Brussels',
//       },
//       {
//         id: 'f447194b-c71f-44a7-b3cb-33876aef8a88',
//         name: 'Israel',
//         capital: 'Jerusalem',
//       },
//       {
//         id: '6cdc1437-9d6d-4a43-a691-4cabbd3b0c40',
//         name: 'New Zealand',
//         capital: 'Wellington',
//       },
//       {
//         id: '52323ce3-b474-427f-95ae-b1202cd3026f',
//         name: 'Nicaragua',
//         capital: 'Managua',
//       },
//     ]

//     for (const country of countries) {
//       await Country.updateOrCreate(
//         { name: country.name },
//         {
//           name: country.name,
//           id: country.id,
//           capital: country.capital,
//         }
//       )
//     }
//   }
// }
