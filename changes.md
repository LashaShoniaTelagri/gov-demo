1. In filers (left navigation) we need to change `any` to `Please choose`
2. We need to add area filters by ha as we have Orchard ages, user should be able to specify numbers, we need to have 2 inputs for that. 
3. In Layers:
    1. We need to hide Orchards and by default all orchards should be visible on the map
    2. Add laboratory analysis in filter which should have sub layers 
        1. PH 
        2. N
        3. P
        4. L
        5. All sub layer should have 2 input like we have it in scores and user should be able to specify numbers between 0-100 and when user selects one or more options we need to filter results based on this on the map
4. Instead of NDVI Heatmap we need to have `Index` and it’s sublayers and they should be just only checkable, there is no need to have an inputs : 
    - NDVI
    - EVI
    - NDRE
    - MCARI
    - PRI
    - NDWI
    - NDMI
    - LSWI
    - SAVI
    - MSAVI

5.In filter section we need to add this checkboxes as well 


- Diseases - ge: დაავადებები 
    - Alternaria alternata - ge: ალტერნარია
    - Verticillium dahliae - ge: ვერტიცილიოზი
    - Colletotrichum acutatum - ge: ანთრაქნოზი

- Insects - მავნებლები:

    - Myzus persicae - ge: მწვანე ბუგრი
    - Cydia pomonella - ge: ნაყოფჭამია
    - Tetranychus urticae - ge: ობობის ტკიპა (Tetranychus urticae)

here ge:<text> means that how we should show this values in Georgian language