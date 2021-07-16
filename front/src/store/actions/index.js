export const actionAuthLogin = (jwt) => ({ type: 'LOGIN', jwt });

export const actionPromise = (name, promise) => {
  const actionPending = () => ({
    type: 'PROMISE',
    name,
    status: 'PENDING',
    payload: null,
    error: null,
  });
  const actionResolved = (payload) => ({
    type: 'PROMISE',
    name,
    status: 'RESOLVED',
    payload,
    error: null,
  });
  const actionRejected = (error) => ({
    type: 'PROMISE',
    name,
    status: 'REJECTED',
    payload: null,
    error,
  });

  return async (dispatch) => {
    dispatch(actionPending());
    let payload;
    try {
      payload = await promise;
      dispatch(actionResolved(payload));
    } catch (e) {
      dispatch(actionRejected(e));
    }

    return payload;
  };
};

export const actionEnter = (login, password) => async (dispatch) => {
  const registration = await dispatch(
    actionPromise(
      'registration',
      // eslint-disable-next-line no-undef
      fetch('http://127.0.0.1:5050/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: login,
          password,
        }),
      }).then((res) => res.json()),
    ),
  );
  if (!registration.errors) {
    if (registration.token) {
      dispatch(actionAuthLogin(registration.token));
      // eslint-disable-next-line no-undef
      window.location.reload();
    }
  }
};
