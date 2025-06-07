def test_pending_lot_access(api_client, donor_user, charity_user, pending_lot, buyer_user):
    api_client.force_authenticate(user=donor_user)
    response = api_client.get(f'/api/v1/lots/{pending_lot.id}/')
    assert response.status_code == 200
    api_client.force_authenticate(user=charity_user)
    response = api_client.get(f'/api/v1/lots/{pending_lot.id}/')
    assert response.status_code == 200
    api_client.force_authenticate(user=buyer_user)
    response = api_client.get(f'/api/v1/lots/{pending_lot.id}/')
    assert response.status_code == 404



    