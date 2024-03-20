export const difficultyOptions = [
    {
        label: "easy",
        value: 1
    },
    {
        label: "normal",
        value: 2
    },
    {
        label: "hard",
        value: 3
    }
]
export const options = [
    {
        value: 'skiPoint',
        label: 'SkiPoint',
        children: [
            {
                value: 'level1',
                label: 'Level 1',
                children: [
                    {
                        value: 'L001',
                        label: 'SnowPeak',
                    },
                    {
                        value: 'L002',
                        label: 'FrostHaven',
                    },
                ],
            }, {
                value: 'level2',
                label: 'Level 2',
                children: [
                    {
                        value: 'L003',
                        label: 'IceCrest',
                    },
                    {
                        value: 'L004',
                        label: 'Glacier',
                    },
                ],
            }
        ],
    },
    {
        value: 'facility',
        label: 'Facility',
        children: [
            {
                value: 'toilet',
                label: 'Toilet',
                children: [
                    {
                        value: 'S001',
                        label: 'Toilet-01',
                    },
                    {
                        value: 'S003',
                        label: 'Toilet-02',
                    }
                ],
            },
            {
                value: 'restaurant',
                label: 'Restaurant',
                children: [
                    {
                        value: 'S002',
                        label: 'Asian sushi',
                    },
                ],
            },
        ],
    },
];