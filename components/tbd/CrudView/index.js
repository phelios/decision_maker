import {FlatList, Modal, View} from 'react-native';
import {
  Body,
  Button,
  Container,
  Content,
  Form,
  Header,
  Input,
  Item,
  Label,
  Left,
  ListItem,
  Right,
  Text,
  Title,
} from 'native-base';
import React, {useEffect, useState} from 'react';
import {flexStyle} from '../../layout/style';

export default function CrudView(props) {
  const {fields, displayFields, url} = props;

  const [modalVisible, setModalVisible] = useState(false);
  const [listData, setListData] = useState([]);

  const initData = fields.reduce((obj, val) => {
    obj[val] = null;
    return obj;
  }, {});

  const [formData, setFormData] = useState(initData);

  function renderEdit(item) {
    console.log(item);
    setModalVisible(true);
    // setName(item.name);
    // setWeight(item.weight.toString());
    // setId(item.id);
  }

  function renderRow(data) {
    const {item} = data;
    return (
      <ListItem onPress={() => renderEdit(item)}>
        <Left>
          <Text>{item[displayFields.left]}</Text>
        </Left>
        <Right>
          <Text>{item[displayFields.right]}</Text>
        </Right>
      </ListItem>
    );
  }

  function resetData() {
    setFormData(initData);
  }

  function closeModal() {
    resetData();
    setModalVisible(false);
  }

  function updateFormData(fieldName, text) {
    setFormData({...formData, [fieldName]: text});
  }

  function _fetch(handler, _url, data) {
    fetch(_url, data)
      .then(r => handler(r))
      .then(r => closeModal());
  }

  function handleNew() {
    let data = {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    return _fetch(
      r => {
        r.json().then(newData => setListData([...listData, newData]));
      },
      url,
      data,
    );
  }

  function handleDelete(itemId) {
    let data = {
      method: 'DELETE',
    };
    return fetch(`${url}/${itemId}`, data)
      .then(response => {
        setFormData(
          formData.filter(v => {
            return v.id !== itemId;
          }),
        );
        closeModal();
      })
      .then(err => {
        console.log(err);
      });
  }

  function handleUpdate(itemId) {
    const formData = {
      name: formData.name,
      weight: formData.weight,
    };

    let data = {
      method: 'PUT',
      body: JSON.stringify(formData),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    return fetch(`https://dm-api.herokuapp.com/api/criteria/${itemId}`, data)
      .then(response => {
        console.log(response);

        const idx = listData.findIndex(i => i.id === itemId);
        listData[idx] = {
          id: formData.id,
          name: formData.name,
          weight: formData.weight,
        };
        setListData(listData);
        closeModal();
      })
      .then(err => {
        console.log(err);
      });
  }

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const res = fetch(url);
    res
      .then(data => data.json())
      .then(json => setListData(json))
      .then(err => console.log(err));
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  function renderModalButtons() {
    if (formData.id) {
      return (
        <>
          <Button style={flexStyle.button} onPress={handleUpdate}>
            <Text>Update</Text>
          </Button>
          <Button danger style={flexStyle.button} onPress={handleDelete}>
            <Text>Delete</Text>
          </Button>
        </>
      );
    } else {
      return (
        <Button style={flexStyle.button} onPress={handleNew}>
          <Text>Add</Text>
        </Button>
      );
    }
  }

  return (
    <>
      <FlatList
        data={listData}
        renderItem={renderRow}
        keyExtractor={item => item.id.toString()}
      />
      <Button block onPress={() => setModalVisible(true)}>
        <Text>Add</Text>
      </Button>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <Container>
          <Header>
            <Left />
            <Body>
              <Title>Add Criteria</Title>
            </Body>
            <Right>
              <Button danger transparent onPress={() => closeModal()}>
                <Text>close</Text>
              </Button>
            </Right>
          </Header>
          <Content padder>
            <Form>
              {fields.map(field => (
                <Item stackedLabel key={field}>
                  <Label style={flexStyle.label}>{field}</Label>
                  <Input
                    value={formData[field]}
                    onChangeText={t => updateFormData(field, t)}
                  />
                </Item>
              ))}
            </Form>
            <View style={flexStyle.rowFlex}>{renderModalButtons()}</View>
          </Content>
        </Container>
      </Modal>
    </>
  );
}
