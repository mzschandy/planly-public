### Basic ways to query for data and how things should work :

I'm going to use Item class for all basic querying :
```
class Item(models.Model):
    _id : <Internal ID>
    name = models.CharField(max_length=30)
    detail = models.CharField(max_length=100)
    objects = models.DjongoManager()
    participants = models.ArrayField(model_container=SomeClass, default=[])
    def _str_(self):
        return self.name
```

### Creating a new object : 
```
from core import Models.item as item

sample = item(name="Item1", detail="good Item")
sample.save()

or 

sample = item()
sample.name="Item1"
sample.detail="good Item"
sample.save()
```
### Inserting inside arrayField:
so far I could just find 1 way to insert inside inside fields which are an array:
```
temp = {"key":someClass.key.value, "key2":someClass.key2.value}
sample.participants.append(temp)
sample.save()
```
This wont work : 
```
classExample = someClass(init_with_params)
sample.participants.append(classExample)
```
### getting items via one field: 
```
item.objects.get(name="Item1")
```

### Using pymongo commands instead : 
check here for basic commands(https://docs.mongodb.com/manual/tutorial/query-documents/).  

-all these methods are available inside objects method in a class.   
-use 'mongo_ ' prefix to any mongodb commands to make that work.   
```
var = item.objects.find({"name": "Item1", "detail":"Something"})
# var is an iterator object so to access items in it,
for i in var:
    print(i.name) #do things here

or 
res = [i for i in var]
```
1. `find_all(condition=)`, `find_one(condition=)` for finer control.   
2. $in used for ranges `(item.objects.find({"name": $in:["A", "D"]}))`.   
3. $lt means less than ^(used same way as above).   

### Updating in 1 query:
```
items.objects.mongo_update_one({"id":19}, {'$set':{"name":"Awesome Event"}})
```
....




